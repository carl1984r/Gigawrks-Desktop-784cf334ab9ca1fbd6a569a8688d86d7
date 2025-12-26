package chat

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"log"
)

var (
	LiveOTO        int
	OnlineUsers    []uint
	OTOs           map[int][]ContactMessage
	OnlineContacts map[int]struct{}
)

type MessageOTO struct {
	ID          int     `json:"id"`
	UUID        string  `json:"uuid"`
	CreatedByID int     `json:"created_by_id"`
	Content     string  `json:"content"`
	ContentType string  `json:"content_type"`
	Media       []Media `json:"media"`
}

type Media struct {
	URL  string `json:"url"`
	Type string `json:"type"`
	Name string `json:"name"`
}

//type ReadEvent struct {
//	Type     string       `json:"type"`
//	Messages []MessageDTO `json:"messages"`
//}

func HandleOTOWsMsgs(ctx context.Context, selfId int, msg *ReceivedWSMessage) {
	switch msg.Type {
	case "chat_read":
		log.Println("", msg.TargetId != LiveOTO)
		log.Println("msg.Messages", msg.Messages)
		OTOs[msg.TargetId] = msg.Messages
		runtime.EventsEmit(ctx, "chat_read", msg)
		break
	case "online_contacts":
		for _, contact := range msg.Users {
			OnlineContacts[contact] = struct{}{}
		}
		runtime.EventsEmit(ctx, "online_contacts", msg.Users)
	case "online_status":
		if _, ok := OnlineContacts[msg.UserId]; !ok {
			if msg.Status == 1 {
				OnlineContacts[msg.UserId] = struct{}{}
				runtime.EventsEmit(ctx, "online_status_update", map[string]interface{}{
					"userId": msg.UserId,
					"status": msg.Status,
				})
			}
		} else {
			if msg.Status == 0 {
				log.Println("online_status_update", msg.UserId)
				delete(OnlineContacts, msg.UserId)
				runtime.EventsEmit(ctx, "online_status_update", map[string]interface{}{
					"userId": msg.UserId,
					"status": msg.Status,
				})
			}
		}
	case "chat_message":
		peerId := 0
		if msg.From == selfId {
			peerId = msg.To
		} else {
			peerId = msg.From
		}
		if msg.Err == "" {
			OTOs[peerId] = append(OTOs[peerId], msg.Message)
		}
		if LiveOTO == peerId {
			runtime.EventsEmit(ctx, "chat_message", msg)
		} else {
			if msg.Err == "" {
				runtime.EventsEmit(ctx, "chat_message_notification", peerId)
			}
		}

	case "chat_message_delete", "chat_delete":
		//peerId := 0
		//if msg.From == selfId {
		//	peerId = msg.To
		//} else {
		//	peerId = msg.From
		//}
		//if LiveOTO == peerId {
		//}
		runtime.EventsEmit(ctx, "chat_message_delete", msg)
		//OTOs[peerId] = append(OTOs[peerId], msg.Message)

	}
}
