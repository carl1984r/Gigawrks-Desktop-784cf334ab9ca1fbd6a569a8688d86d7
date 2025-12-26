package websocket

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"log"
	"sync"
	"time"
)

type WSConnection struct {
	Id    string
	Conn  *websocket.Conn
	Mutex sync.Mutex
}

//var ActiveWSConnections map[string]*WSConnection

func NewWSConnection(conn *websocket.Conn) *WSConnection {
	ws := &WSConnection{
		Id:    uuid.NewString(),
		Conn:  conn,
		Mutex: sync.Mutex{},
	}
	//ActiveWSConnections[ws.Id] = ws
	return ws
}

func (wsConn *WSConnection) EnqueueMessage(data interface{}) error {
	wsConn.Mutex.Lock()
	defer wsConn.Mutex.Unlock()
	if wsConn.Conn == nil {
		return fmt.Errorf("nil *Conn founc")
	}
	return wsConn.Conn.WriteJSON(data)
}
func (wsConn *WSConnection) IsAlive() bool {
	if wsConn == nil {
		return false
	}
	// Try writing a ping
	wsConn.Mutex.Lock()
	defer wsConn.Mutex.Unlock()
	wsConn.Conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
	err := wsConn.Conn.WriteMessage(websocket.PingMessage, []byte{})
	if err != nil {
		log.Println("Ping failed:", err)
		return false
	}

	return true
}
func (wsConn *WSConnection) Close() {
	//delete(ActiveWSConnections, wsConn.Id)
	wsConn.Conn.Close()
}
