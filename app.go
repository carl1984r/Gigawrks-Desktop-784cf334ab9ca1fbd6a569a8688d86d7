package main

import (
	"Desktop-Wails-Gigawrks/configs"
	"Desktop-Wails-Gigawrks/controllers/Auth"
	"Desktop-Wails-Gigawrks/controllers/chat"
	"Desktop-Wails-Gigawrks/controllers/notifications"
	"Desktop-Wails-Gigawrks/controllers/webrtc"
	"Desktop-Wails-Gigawrks/controllers/websocket"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/cookiejar"
	"sync"
	"time"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	ws "github.com/gorilla/websocket"
	"github.com/zalando/go-keyring"
)

// App struct
type App struct {
	ctx                  context.Context
	accessToken          string
	accessTokenExpiry    time.Time
	userData             Auth.User
	refreshToken         string
	onlineWS             *websocket.WSConnection
	onlineCableWS        *websocket.WSConnection
	onlineNotifications  string
	liveOTO              int
	cancelWS 						 context.CancelFunc
  mu       						 sync.Mutex // To prevent race conditions during reconnects
}
type SavedMemory struct {
	RefreshToken string
	AccessToken  string
}

var (
	jar, _ = cookiejar.New(nil)
	client = &http.Client{
		Jar:     jar,
		Timeout: 10 * time.Second,
	}
)

const (
	secretService      = "GigawrksMeetings"
	secretRefreshToken = "secretRefreshToken"
	secretAccessToken  = "secretAccessToken"
)

func (a *App) CopyToClipboard(text string) {
    runtime.ClipboardSetText(a.ctx, text)
}

func (a *App) saveSecretTokens() {
	if a.refreshToken != "" {
		_ = keyring.Set(secretService, secretRefreshToken, a.refreshToken)
	}
	if a.accessToken != "" {
		_ = keyring.Set(secretService, secretAccessToken, a.accessToken)
	}
}

func (a *App) loadSecretTokens() {
	refreshToken, err := keyring.Get(secretService, secretRefreshToken)
	if err == nil {
		a.refreshToken = refreshToken
	}
	accessToken, err := keyring.Get(secretService, secretAccessToken)
	if err == nil {
		a.accessToken = accessToken
	}
	log.Println("loadSecretTokens", a.refreshToken, accessToken, err)
}
func (a *App) deleteSecretToken() {
	keyring.Delete(secretService, secretAccessToken)
	keyring.Delete(secretService, secretRefreshToken)
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{ctx: context.Background()}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.loadSecretTokens()
	// Run in background goroutine so it doesn’t block UI
	go func() {
		for {
			// If context canceled (app closed), exit loop
			select {
			case <-a.ctx.Done():
				a.saveSecretTokens()
				return
			default:
			}
			// Check if token available
			if a.accessToken != "" && (a.onlineWS == nil || !a.onlineWS.IsAlive()) {
				if Auth.CheckExpJWT(a.accessToken) {
					chat.OnlineContacts = make(map[int]struct{})
					chat.OTOs = make(map[int][]chat.ContactMessage)
					go a.ConnectToWS()
					break // ✅ exit loop after successful send
				}

			}

			// Wait before checking again
			time.Sleep(1 * time.Second)
		}
	}()

	go func() {
		for {
			if a.GetAccessToken() != "" && (a.onlineWS != nil && !a.onlineWS.IsAlive()) {
				a.onlineWS.Close()
				a.onlineWS = nil
				go a.ConnectToWS()
			}
			time.Sleep(2 * time.Second)
		}

	}()
}
func (a *App) shutdown(ctx context.Context) {
	a.ctx = ctx
	a.saveSecretTokens()
}
func (a *App) LoginWithEmail(email, password string) string {
	url := fmt.Sprintf("%s/v1/auth/login", configs.AuthURL)
	loginResponse, err := Auth.Login(a.ctx, client, url, email, password)
	log.Printf("loginResponse %+v, %+v", loginResponse, err)
	if err != nil {
		log.Println(err)
		return ""
	}
	a.accessToken = loginResponse.Response.AccessToken
	a.refreshToken = loginResponse.Response.RefreshToken
	a.userData = loginResponse.Response.User
	a.saveSecretTokens()
	if a.onlineWS == nil {
		go a.ConnectToWS()
	}
	return a.accessToken
}
func (a *App) Logout() bool {
	url := fmt.Sprintf("%s/v1/auth/logout", configs.AuthURL)
	logout, err := Auth.Logout(a.ctx, client, url, a.accessToken)
	if err != nil {
		if logout != nil {
			return logout.Response
		}
		return false
	}
	a.accessToken = ""
	a.refreshToken = ""
	a.userData = Auth.User{}
	a.onlineWS.Close()
	a.onlineWS = nil
	a.deleteSecretToken()
	a.liveOTO = 0
	return logout.Response
}

func (a *App) GetAccessToken() string {
	if a.accessToken != "" {
		tokenValid := Auth.CheckExpJWT(a.accessToken)
		if tokenValid {
			return a.accessToken
		}
	}
	if a.refreshToken != "" {
		refreshTokenValid := Auth.CheckExpJWT(a.refreshToken)
		if refreshTokenValid {
			url := fmt.Sprintf("%s/v1/auth/refresh", configs.AuthURL)
			token, err := Auth.GetAccessTokenFromRefreshToken(a.ctx, client, url, a.refreshToken)
			if err != nil {
				log.Println(err)
				return ""
			}
			a.accessToken = token.Response.AccessToken
			return a.accessToken
		}
	}
	return ""
}

func (a *App) IsLoggedIn() int {
	return a.GetLoggedInUserData().ID
}

func (a *App) OnlineWSAddr() string {
	return configs.WsURL
}

func (a *App) GetLoggedInUserData() Auth.User {
	if a.userData.ID == 0 && a.GetAccessToken() != "" {
		data, err := Auth.GetLoggedInUserData(a.ctx, client, a.accessToken)
		if err != nil {
			return Auth.User{}
		}
		a.userData = data.Response
	}
	return a.userData
}

func (a *App) GetContacts(q map[string]string) []Auth.Contact {
	url := fmt.Sprintf("%s/api/v1/contacts", configs.ChatURL)
	resp, err := Auth.GetContacts(a.ctx, client, url, a.GetAccessToken(), q)
	if err != nil {
		log.Println(err)
		return nil
	}
	log.Println(resp.Response)
	return resp.Response
}

//func (a *App) GetOTOChat(userId string) []chat.ContactMessage {
//
//}

// Example function to connect to WS
func (a *App) ConnectToWS() (err string) {
	// Dial server
	conn, _, e := ws.DefaultDialer.Dial(configs.WsURL, nil)
	if e != nil {
		log.Fatal("dial error:", e)
	}
	a.onlineWS = websocket.NewWSConnection(conn)
	defer a.onlineWS.Close()
	if a.accessToken != "" {
		authMsg := map[string]string{
			"type":  "auth",
			"token": "Bearer " + a.accessToken,
		}
		if e := a.onlineWS.EnqueueMessage(authMsg); e != nil {
			log.Println("❌ Send auth failed:", e)
			return e.Error()
		} else {
			log.Printf("✅ Sent auth message: %+v", authMsg)
		}

	}
	// Listen for messages
	for {
		_, msg, e := conn.ReadMessage()
		if e != nil {
			log.Println("read error:", e)
			return e.Error()
		}
		var msgType struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(msg, &msgType); err != nil {
			log.Println("❌ JSON parse error:", err)
			continue
		}

		log.Println("msgType.Type", string(msg))

		// Define a generic map for dynamic JSON
		var data chat.ReceivedWSMessage

		// Try to unmarshal the JSON
		if err := json.Unmarshal(msg, &data); err != nil {
			log.Println("❌ JSON parse error:", err)
			continue
		}
		fmt.Printf("📩 Received JSON: %+v\n", data)
		chat.HandleOTOWsMsgs(a.ctx, a.userData.ID, &data)
		// Print as parsed JSON

	}
}

func (a *App) MarkAllNotificationsAsRead() {
		go a.connectAndSend(`{"action":"mark_as_interacted","id":false}`)
}

func (a *App) MarkNotificationAsRead(id string) {
    data := fmt.Sprintf(`{"action":"mark_as_interacted","id":%s}`, id)
    go a.connectAndSend(data)
}

func (a *App) ConnectToNotificationsWS() {
    go a.connectAndSend(`{"action":"get_notifications"}`)
}

func (a *App) connectAndSend(initialData string) {
    a.mu.Lock()
    if a.cancelWS != nil { a.cancelWS() }
    ctx, cancel := context.WithCancel(context.Background())
    a.cancelWS = cancel
    a.mu.Unlock()

    defer log.Println("🛑 WebSocket exited.")

    header := http.Header{}
    header.Add("Sec-WebSocket-Protocol", "actioncable-v1-json")
    header.Add("Authorization", "Bearer "+a.accessToken)

    conn, _, err := ws.DefaultDialer.Dial(configs.NotificationsURL, header)
    if err != nil { return }
    defer conn.Close()

    identifier := fmt.Sprintf(`{"channel":"NotificationSocketChannel","token":"%s"}`, a.accessToken)
    subscribeMsg := map[string]string{"command": "subscribe", "identifier": identifier}
    if err := conn.WriteJSON(subscribeMsg); err != nil { return }

    for {
        select {
        case <-ctx.Done():
            return
        default:
            _, msg, err := conn.ReadMessage()
            if err != nil { return }

            var raw map[string]any
            if json.Unmarshal(msg, &raw) != nil { continue }

            if raw["type"] == "welcome" {
                cmd := notifications.ActionCableCommand{
                    Command:    "message",
                    Identifier: identifier,
                    Data:       initialData,
                }
                conn.WriteJSON(cmd)
            }

            if _, ok := raw["identifier"].(string); ok {
                runtime.EventsEmit(a.ctx, "new_notifications", string(msg))
            }
        }
    }
}

func (a *App) SendChatReadWsMsg(userId int) (err string) {
	err = a.SendOnlineWsMsg(chat.OnlineWsMessage{
		Type:     "chat_read",
		TargetID: userId,
	})
	chat.LiveOTO = userId
	return err
}

func (a *App) SendOnlineWsMsg(msg chat.OnlineWsMessage) (err string) {
	if a.onlineWS == nil {
		a.ConnectToWS()
	}
	log.Printf("msg to send over ws %+v", msg)
	if !a.onlineWS.IsAlive() {
		time.Sleep(2 * time.Second)
	}
	if e := a.onlineWS.EnqueueMessage(msg); e != nil {
		return e.Error()
	}
	return ""
}

func (a *App) GetOnlineContacts() []int {
	onlineContacts := make([]int, 0, len(chat.OnlineContacts))
	for id := range chat.OnlineContacts {
		onlineContacts = append(onlineContacts, id)
	}
	log.Println("onlineContacts", onlineContacts)
	return onlineContacts
}

func (a *App) CreateMeetingRoom(title string, invitationRequired, codeRequired, WaitingRoomRequired bool, peersLimit int) *webrtc.Response[webrtc.RoomCreateResponse] {
	room, err := webrtc.CreateRoom(a.ctx, client, a.GetAccessToken(), title, invitationRequired, codeRequired, WaitingRoomRequired, peersLimit)
	if err != nil {
		return room
	}
	return room
}
func (a *App) GetMyRooms() *webrtc.Response[[]webrtc.RoomCreateResponse] {
	room, err := webrtc.GetMyRooms(a.ctx, client, a.GetAccessToken())
	if err != nil {
		room.Error = err.Error()
		return room
	}
	return room
}
func (a *App) GetRoomTurnCred(uuid string) *webrtc.Response[webrtc.RoomCredResponse] {
	room, err := webrtc.GetRoomTurnCred(a.ctx, client, a.GetAccessToken(), uuid)
	log.Println("GetRoomTurnCred", room, err)
	if err != nil {
		room.Error = err.Error()
		return room
	}
	return room
}
func (a *App) GetRoomDetails(uid string) *webrtc.Response[webrtc.RoomCreateResponse] {
	room, err := webrtc.GetRoomDetails(a.ctx, client, a.GetAccessToken(), uid)
	log.Println("GetRoomDetails", room, err)
	if err != nil {
		room.Error = err.Error()
		return room
	}
	return room
}
