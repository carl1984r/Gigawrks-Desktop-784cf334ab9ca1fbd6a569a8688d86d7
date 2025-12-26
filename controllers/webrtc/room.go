package webrtc

import (
	"Desktop-Wails-Gigawrks/configs"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Room struct {
	Id                  string
	Title               string
	RoomOwner           uint
	InvitationRequired  bool
	CodeRequired        bool
	WaitingRoomRequired bool
	Code                string
	CreatedAt           *time.Time
	LastJoined          time.Time
	TurnUser            string
	TurnPassword        string
}

type DetailsResponse struct {
	Details string `json:"details"`
}
type RoomCreateResponse struct {
	Code                string `json:"code"`
	CodeRequired        bool   `json:"code_required"`
	CreatedAt           string `json:"created_at"`
	Id                  string `json:"id"`
	InvitationRequired  bool   `json:"invitation_required"`
	RoomOwner           int    `json:"room_owner"`
	Title               string `json:"title"`
	WaitingRoomRequired bool   `json:"waiting_room_required"`
	MaxPeers            int    `json:"max_peers"`
	Details             string `json:"details"`
	LivePeers           int    `json:"live_peers"`
}

type RoomCreateRequest struct {
	CodeRequired        bool   `json:"code_required"`
	InvitationRequired  bool   `json:"invitation_required"`
	Title               string `json:"title"`
	WaitingRoomRequired bool   `json:"waiting_room_required"`
	PeersLimit          int    `json:"peers_limit"`
}
type RoomCredRequest struct {
	RoomId string `json:"room_id"`
}
type RoomCredResponse struct {
	Password string `json:"password"`
	StunUrl  string `json:"stun_url"`
	TurnUrl  string `json:"turn_url"`
	Type     string `json:"type"`
	User     string `json:"user"`
}
type Response[Res any] struct {
	StatusCode int    `json:"status_code"`
	Error      string `json:"error"`
	Response   Res    `json:"response"`
}

func CreateRoom(ctx context.Context, client *http.Client, accessToken, title string, invitationRequired, codeRequired, WaitingRoomRequired bool, peers_limit int) (*Response[RoomCreateResponse], error) {
	url := fmt.Sprintf("%s/api/v1/room/create", configs.RTCURL)
	// build payload
	respL := &Response[RoomCreateResponse]{}
	payload := RoomCreateRequest{
		CodeRequired:        codeRequired,
		InvitationRequired:  invitationRequired,
		Title:               title,
		WaitingRoomRequired: WaitingRoomRequired,
		PeersLimit:          peers_limit,
	}
	b, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	// create request with context (useful for timeout/cancel)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	// send request
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// check status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("create room failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne RoomCreateResponse

	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding Room create response:", err)
		return respL, err
	}
	respL.Response = resposne
	return respL, nil
}

func GetMyRooms(ctx context.Context, client *http.Client, accessToken string) (*Response[[]RoomCreateResponse], error) {
	url := fmt.Sprintf("%s/api/v1/room/mine", configs.RTCURL)
	// build payload
	respL := &Response[[]RoomCreateResponse]{}

	// create request with context (useful for timeout/cancel)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	// send request
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// check status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("create room failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne []RoomCreateResponse

	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding Room create response:", err)
		return respL, err
	}
	respL.Response = resposne
	return respL, nil
}

func GetRoomDetails(ctx context.Context, client *http.Client, accessToken, uuid string) (*Response[RoomCreateResponse], error) {
	url := fmt.Sprintf("%s/api/v1/room/%s", configs.RTCURL, uuid)
	// build payload
	respL := &Response[RoomCreateResponse]{}

	// create request with context (useful for timeout/cancel)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	// send request
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// check status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("create room failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne RoomCreateResponse

	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding Room create response:", err)
		return respL, err
	}
	respL.Response = resposne
	return respL, nil
}

func GetRoomTurnCred(ctx context.Context, client *http.Client, accessToken, uuid string) (*Response[RoomCredResponse], error) {
	url := fmt.Sprintf("%s/api/v1/room/%s/cred", configs.RTCURL, uuid)
	// build payload
	respL := &Response[RoomCredResponse]{}
	payload := RoomCredRequest{
		RoomId: uuid,
	}
	b, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	// create request with context (useful for timeout/cancel)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	// send request
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// check status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("create room failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne RoomCredResponse
	//var chResp map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding Room create response:", err)
		return respL, err
	}
	//log.Println("resp.Body", chResp)
	respL.Response = resposne
	return respL, nil
}
