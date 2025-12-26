package Auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Contact struct {
	ContactNote string `json:"contact_note"`
	FirstName   string `json:"first_name"`
	GigaTag     string `json:"gigatag"`
	ID          int    `json:"id"`
	LastName    string `json:"last_name"`
	UserID      int    `json:"user_id"`
	UserImage   string `json:"user_image"`
}

// GetContacts sends email/password to the auth endpoint and returns the token.
func GetContacts(ctx context.Context, client *http.Client, url, accessToken string, query map[string]string) (*Response[[]Contact], error) {
	// build payload
	respL := &Response[[]Contact]{}

	// create request with context (useful for timeout/cancel)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	if len(query) > 0 {
		q := req.URL.Query()
		for k, v := range query {
			q.Add(k, v)
		}
		req.URL.RawQuery = q.Encode()
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
	if resp.StatusCode != http.StatusOK {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("get contacts: authentication failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne []Contact

	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding login response:", err)
		return respL, err
	}
	respL.Response = resposne
	return respL, nil
}
