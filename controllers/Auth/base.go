package Auth

import (
	"Desktop-Wails-Gigawrks/configs"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Response[Res any] struct {
	StatusCode int    `json:"status_code"`
	Error      string `json:"error"`
	Response   Res    `json:"response"`
}

func GetLoggedInUserData(ctx context.Context, client *http.Client, accessToken string) (*Response[User], error) {
	respL := &Response[User]{}
	// create request with context (useful for timeout/cancel)
	url := fmt.Sprintf("%s/v1/me", configs.AuthURL)
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
	if resp.StatusCode != http.StatusOK {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("get loggedin user: authentication failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne User

	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding login response:", err)
		return respL, err
	}
	respL.Response = resposne
	return respL, nil
}
