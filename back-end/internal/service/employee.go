package service

import (
	"backend/internal/entity"
	"context"
)

func (s Service) GetAllEmployees(ctx context.Context) ([]entity.Employee, error) {
	employees, err := s.data.GetAllEmployees(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to get all employees", map[string]interface{}{"error": err.Error()})
		return nil, s.WrapError(err, "Failed to get all employees")
	}

	for i := range employees {
		employees[i].BirthDateStr = employees[i].BirthDate.Format("2006-01-02")
		employees[i].JoinDateStr = employees[i].JoinDate.Format("2006-01-02")
	}

	s.LogInfo(ctx, "Successfully fetched all employees", nil)
	return employees, nil
}

func (s Service) GetAllReqUpdateEmployee(ctx context.Context) ([]entity.EmployeeRequest, error) {
	employeeRequests, err := s.data.GetAllReqUpdateEmployee(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to get all employee update requests", map[string]interface{}{"error": err.Error()})
		return nil, s.WrapError(err, "Failed to get all employee update requests")
	}

	s.LogInfo(ctx, "Successfully fetched all employee update requests", nil)
	return employeeRequests, nil
}

func (s Service) GetEmployeeByID(ctx context.Context, id int) (entity.Employee, error) {
	employee, err := s.data.GetEmployeeByID(ctx, id)
	if err != nil {
		s.LogError(ctx, "Failed to get employee by ID", map[string]interface{}{"error": err.Error(), "id": id})
		return entity.Employee{}, s.WrapError(err, "Failed to get employee by ID")
	}

	employee.BirthDateStr = employee.BirthDate.Format("2006-01-02")
	employee.JoinDateStr = employee.JoinDate.Format("2006-01-02")

	s.LogInfo(ctx, "Successfully fetched employee", map[string]interface{}{"id": id})
	return employee, nil
}

func (s Service) GetEmployeeByNIP(ctx context.Context, nip string) (entity.Employee, error) {
	employee, err := s.data.GetEmployeeByNIP(ctx, nip)
	if err != nil {
		s.LogError(ctx, "Failed to get employee by NIP", map[string]interface{}{"error": err.Error(), "nip": nip})
		return entity.Employee{}, s.WrapError(err, "Failed to get employee by NIP")
	}

	employee.BirthDateStr = employee.BirthDate.Format("2006-01-02")
	employee.JoinDateStr = employee.JoinDate.Format("2006-01-02")

	s.LogInfo(ctx, "Successfully fetched employee", map[string]interface{}{"nip": nip})
	return employee, nil
}

func (s Service) CreateEmployee(ctx context.Context, data entity.Employee) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.CreateEmployee(ctx, data, tx)
	if err != nil {
		s.LogError(ctx, "Failed to create employee", map[string]interface{}{"error": err.Error()})
		_ = tx.Rollback()
		return s.WrapError(err, "Failed to create employee")
	}

	err = tx.Commit()
	if err != nil {
		s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to commit transaction")
	}

	s.LogInfo(ctx, "Successfully created employee", map[string]interface{}{"employee": data})
	return nil
}

func (s Service) CreateReqUpdateEmployee(ctx context.Context, data entity.EmployeeRequest) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.CreateReqUpdateEmployee(ctx, data, tx)
	if err != nil {
		s.LogError(ctx, "Failed to create employee update request", map[string]interface{}{"error": err.Error(), "employee_request": data})
		_ = tx.Rollback()
		return s.WrapError(err, "Failed to create employee update request")
	}

	err = tx.Commit()
	if err != nil {
		s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to commit transaction")
	}

	s.LogInfo(ctx, "Successfully created employee update request", map[string]interface{}{"employee_request": data})
	return nil
}

func (s Service) GetReqUpdateEmployeeByNIP(ctx context.Context, nip string) (string, string, error) {
    status, createdAtStr, err := s.data.GetReqUpdateEmployeeByNIP(ctx, nip)
    if err != nil {
        s.LogError(ctx, "Failed to get request update by NIP", map[string]interface{}{"nip": nip, "error": err.Error()})
        return "", "", s.WrapError(err, "Failed to get request update by NIP")
    }

    s.LogInfo(ctx, "Successfully fetched request update", map[string]interface{}{"nip": nip})
    return status, createdAtStr, nil
}

func (s Service) UpdateEmployee(ctx context.Context, data entity.Employee) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.UpdateEmployee(ctx, data, tx)
	if err != nil {
		s.LogError(ctx, "Failed to update employee", map[string]interface{}{"error": err.Error(), "employee": data})
		_ = tx.Rollback()
		return s.WrapError(err, "Failed to update employee")
	}

	err = tx.Commit()
	if err != nil {
		s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to commit transaction")
	}

	s.LogInfo(ctx, "Successfully updated employee", map[string]interface{}{"employee": data})
	return nil
}

func (s Service) UpdateReqUpdateEmployeeStatus(ctx context.Context, ptid string, status string, rejectReason string) error {
    tx, err := s.data.BeginTx(ctx)
    if err != nil {
        s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
        return s.WrapError(err, "Failed to begin transaction")
    }

    err = s.data.UpdateReqUpdateEmployeeStatus(ctx, ptid, status, rejectReason, tx)
    if err != nil {
        s.LogError(ctx, "Failed to update employee update request status", map[string]interface{}{"error": err.Error(), "ptid": ptid, "status": status})
        _ = tx.Rollback()
        return s.WrapError(err, "Failed to update employee update request status")
    }

    err = tx.Commit()
    if err != nil {
        s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
        return s.WrapError(err, "Failed to commit transaction")
    }

    s.LogInfo(ctx, "Successfully updated employee update request status", map[string]interface{}{"ptid": ptid, "status": status})
    return nil
}

func (s Service) DeleteEmployee(ctx context.Context, id int) error {
	tx, err := s.data.BeginTx(ctx)
	if err != nil {
		s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to begin transaction")
	}

	err = s.data.DeleteEmployee(ctx, id, tx)
	if err != nil {
		s.LogError(ctx, "Failed to delete employee", map[string]interface{}{"error": err.Error(), "id": id})
		_ = tx.Rollback()
		return s.WrapError(err, "Failed to delete employee")
	}

	err = tx.Commit()
	if err != nil {
		s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
		return s.WrapError(err, "Failed to commit transaction")
	}

	s.LogInfo(ctx, "Successfully deleted employee", map[string]interface{}{"id": id})
	return nil
}

func (s Service) DeleteReqUpdateEmployee(ctx context.Context, nip string) error {
    tx, err := s.data.BeginTx(ctx)
    if err != nil {
        s.LogError(ctx, "Failed to begin transaction", map[string]interface{}{"error": err.Error()})
        return s.WrapError(err, "Failed to begin transaction")
    }

    err = s.data.DeleteReqUpdateEmployee(ctx, nip, tx)
    if err != nil {
        s.LogError(ctx, "Failed to delete employee update request by NIP", map[string]interface{}{"nip": nip, "error": err.Error()})
        _ = tx.Rollback()
        return s.WrapError(err, "Failed to delete employee update request by NIP")
    }

    err = tx.Commit()
    if err != nil {
        s.LogError(ctx, "Failed to commit transaction", map[string]interface{}{"error": err.Error()})
        return s.WrapError(err, "Failed to commit transaction")
    }

    s.LogInfo(ctx, "Successfully deleted employee update request by NIP", map[string]interface{}{"nip": nip})
    return nil
}

