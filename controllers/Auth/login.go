package Auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type refreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type LoginResponse struct {
	TFAToken     string `json:"tfa_token"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

type RefreshTokenResponse struct {
	AccessToken string `json:"access_token"`
}

type User struct {
	ID             int     `json:"id"`
	Gigatag        string  `json:"gigatag"`
	Email          string  `json:"email"`
	PhoneNumber    *string `json:"phone_number"` // nullable
	EmailVerified  bool    `json:"email_verified"`
	PhoneVerified  bool    `json:"phone_verified"`
	FirstName      string  `json:"first_name"`
	LastName       string  `json:"last_name"`
	PasscodeActive bool    `json:"passcode_enabled"`
	UserImage      string  `json:"user_image"`
	TFAActive      bool    `json:"tfa_active"`
	//Emp            *string `json:"emp"` // nullable
	Locked bool `json:"locked"`
}

// Login sends email/password to the auth endpoint and returns the token.
func Login(ctx context.Context, client *http.Client, url, email, password string) (*Response[LoginResponse], error) {
	// build payload
	respL := &Response[LoginResponse]{}
	payload := loginRequest{Email: email, Password: password}
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

	// send request
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// check status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("authentication failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne LoginResponse

	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding login response:", err)
		return respL, err
	}
	respL.Response = resposne
	return respL, nil
}

// GetAccessTokenFromRefreshToken sends email/password to the auth endpoint and returns the token.
func GetAccessTokenFromRefreshToken(ctx context.Context, client *http.Client, url, refreshToken string) (*Response[RefreshTokenResponse], error) {
	// build payload
	respL := &Response[RefreshTokenResponse]{}
	payload := refreshTokenRequest{RefreshToken: refreshToken}
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

	// send request
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// check status
	if resp.StatusCode != http.StatusOK {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("authentication failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	var resposne RefreshTokenResponse

	if err := json.NewDecoder(resp.Body).Decode(&resposne); err != nil {
		respL.Error = err.Error()
		log.Println("Error decoding login response:", err)
		return respL, err
	}
	respL.Response = resposne
	return respL, nil
}

// Logout sends email/password to the auth endpoint and returns the token.
func Logout(ctx context.Context, client *http.Client, url, accessToken string) (*Response[bool], error) {
	// build payload
	respL := &Response[bool]{}

	// create request with context (useful for timeout/cancel)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
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
	if resp.StatusCode != http.StatusNoContent {
		respL.StatusCode = resp.StatusCode
		return respL, fmt.Errorf("authentication failed: status %d", resp.StatusCode)
	}
	respL.StatusCode = resp.StatusCode
	respL.Response = true
	return respL, nil
}
