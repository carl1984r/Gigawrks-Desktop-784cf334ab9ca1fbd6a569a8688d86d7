package chat

import "time"

type MiniUserResponse struct {
	ID        uint   `json:"id"`
	GigaTag   string `json:"gigatag"`
	UserImage string `json:"user_image"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type OnlineWsMessage struct {
	Type        string           `json:"type"`
	TargetID    int              `json:"target_id"`
	User        MiniUserResponse `json:"user"`
	Content     string           `json:"content"`
	ContentType string           `json:"content_type"` // text || file
	Uuid        string           `json:"uuid"`
	UserId      uint             `json:"user_id"`
	File        File             `json:"file"`
}

type ReceivedWSMessage struct {
	Type     string           `json:"type"`
	Messages []ContactMessage `json:"messages"`
	Message  ContactMessage   `json:"message"`
	Users    []int            `json:"users"`
	Status   int              `json:"status"`
	From     int              `json:"from"`
	Err      string           `json:"err"`
	To       int              `json:"to"`
	UserId   int              `json:"user_id"`
	TargetId int              `json:"target_id"`
}
type File struct {
	FileName string `json:"file_name"`
	FileSize int64  `json:"file_size"`
	FileType string `json:"file_type"`
	FileData string `json:"file_data"`
}

type ContactMessage struct {
	Id          uint           `json:"id"`
	CreatedById int            `json:"created_by_id"`
	ContactId   int            `json:"contact_id"`
	Uuid        string         `json:"uuid"`
	Content     string         `json:"content"`
	ContentType string         `json:"content_type"`
	IsDeleted   bool           `json:"is_deleted"`
	Status      int            `json:"status"`
	DeletedAt   time.Time      `json:"deleted_at"`
	ReceivedAt  time.Time      `json:"received_at"`
	Media       []ContactMedia `json:"media"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type ContactMedia struct {
	Id          uint      `json:"id"`
	UUID        string    `json:"uuid"`
	Type        string    ` json:"type"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	URL         string    `json:"url"`
	IsDeleted   bool      `json:"is_deleted"`
	CreatedByID uint      `json:"created_by_id"`
	DeletedAt   time.Time `json:"deleted_at,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
