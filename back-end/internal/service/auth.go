package service

import (
	"backend/internal/middleware"
	"context"
	"errors"
)

func (s Service) AuthenticateEmployee(ctx context.Context, nip string, password string) (string, error) {
	employee, err := s.data.GetEmployeeByNIP(ctx, nip)
	if err != nil {
		return "", errors.New("employee not found")
	}

	if employee.Password != password {
		return "", errors.New("invalid password")
	}

	token, err := middleware.GenerateJWT(employee.Username)
	if err != nil {
		return "", errors.New("failed to generate token")
	}

	return token, nil
}
