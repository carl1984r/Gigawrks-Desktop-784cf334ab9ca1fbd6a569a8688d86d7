package Auth

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"log"
	"time"
)

func CheckExpJWT(tokenString string) bool {
	// Parse the token (without verifying signature for this example)
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		log.Println("error in token", err)
		return false
	}

	// Extract claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		// Get exp
		if exp, ok := claims["exp"].(float64); ok {
			expTime := time.Unix(int64(exp), 0).UTC()
			fmt.Println("Token expiration:", expTime)

			if time.Now().UTC().After(expTime) {
				fmt.Println("❌ Token is expired")
				return false
			} else {
				fmt.Println("✅ Token is still valid")
				return true
			}
		} else {
			return false
		}
	}
	return false
}
