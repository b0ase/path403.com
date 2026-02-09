// Package ledger tracks serving events for revenue distribution
package ledger

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// Ledger tracks who served what to whom
type Ledger struct {
	db *sql.DB
}

// ServeEvent records a single content serve
type ServeEvent struct {
	ID          int64     `json:"id"`
	Path        string    `json:"path"`
	ServedBy    string    `json:"served_by"`
	ServedTo    string    `json:"served_to"`
	PricePaid   int64     `json:"price_paid"`
	IssuerShare int64     `json:"issuer_share"`
	ServerShare int64     `json:"server_share"`
	TxID        string    `json:"tx_id"`
	Timestamp   time.Time `json:"timestamp"`
}

// SupplyInfo tracks supply for a path
type SupplyInfo struct {
	Path   string `json:"path"`
	Supply int64  `json:"supply"`
}

// Invoice tracks a pending payment request
type Invoice struct {
	Nonce   string `json:"nonce"`
	Path    string `json:"path"`
	Amount  int64  `json:"amount"`
	Expires int64  `json:"expires"`
}

// New creates or opens a ledger database
func New(dbPath string) (*Ledger, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open ledger: %w", err)
	}

	// Create tables if they don't exist
	schema := `
	CREATE TABLE IF NOT EXISTS serve_events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		path TEXT NOT NULL,
		served_by TEXT NOT NULL,
		served_to TEXT NOT NULL,
		price_paid INTEGER NOT NULL,
		issuer_share INTEGER NOT NULL,
		server_share INTEGER NOT NULL,
		tx_id TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS supply (
		path TEXT PRIMARY KEY,
		supply INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS invoices (
		nonce TEXT PRIMARY KEY,
		path TEXT NOT NULL,
		amount INTEGER NOT NULL,
		expires INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_serve_path ON serve_events(path);
	CREATE INDEX IF NOT EXISTS idx_serve_by ON serve_events(served_by);
	CREATE INDEX IF NOT EXISTS idx_serve_to ON serve_events(served_to);
	CREATE INDEX IF NOT EXISTS idx_invoice_path ON invoices(path);
	`

	if _, err := db.Exec(schema); err != nil {
		return nil, fmt.Errorf("failed to create schema: %w", err)
	}

	return &Ledger{db: db}, nil
}

// RecordServe logs a serve event and increments supply
func (l *Ledger) RecordServe(event ServeEvent) error {
	tx, err := l.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert serve event
	_, err = tx.Exec(`
		INSERT INTO serve_events (path, served_by, served_to, price_paid, issuer_share, server_share, tx_id)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, event.Path, event.ServedBy, event.ServedTo, event.PricePaid, event.IssuerShare, event.ServerShare, event.TxID)
	if err != nil {
		return fmt.Errorf("failed to insert serve event: %w", err)
	}

	// Increment supply
	_, err = tx.Exec(`
		INSERT INTO supply (path, supply) VALUES (?, 1)
		ON CONFLICT(path) DO UPDATE SET supply = supply + 1
	`, event.Path)
	if err != nil {
		return fmt.Errorf("failed to update supply: %w", err)
	}

	return tx.Commit()
}

// GetSupply returns the current supply for a path
func (l *Ledger) GetSupply(path string) (int64, error) {
	var supply int64
	err := l.db.QueryRow("SELECT supply FROM supply WHERE path = ?", path).Scan(&supply)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return supply, nil
}

// GetServeEvents returns serve events for a path
func (l *Ledger) GetServeEvents(path string, limit int) ([]ServeEvent, error) {
	rows, err := l.db.Query(`
		SELECT id, path, served_by, served_to, price_paid, issuer_share, server_share, tx_id, timestamp
		FROM serve_events
		WHERE path = ?
		ORDER BY timestamp DESC
		LIMIT ?
	`, path, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []ServeEvent
	for rows.Next() {
		var e ServeEvent
		if err := rows.Scan(&e.ID, &e.Path, &e.ServedBy, &e.ServedTo, &e.PricePaid, &e.IssuerShare, &e.ServerShare, &e.TxID, &e.Timestamp); err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, rows.Err()
}

// GetEarnings returns total earnings for a node
func (l *Ledger) GetEarnings(nodeName string) (int64, error) {
	var total int64
	err := l.db.QueryRow(`
		SELECT COALESCE(SUM(server_share), 0) FROM serve_events WHERE served_by = ?
	`, nodeName).Scan(&total)
	return total, err
}

// GetStats returns aggregate stats
func (l *Ledger) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	var totalServes int64
	l.db.QueryRow("SELECT COUNT(*) FROM serve_events").Scan(&totalServes)
	stats["total_serves"] = totalServes

	var totalRevenue int64
	l.db.QueryRow("SELECT COALESCE(SUM(price_paid), 0) FROM serve_events").Scan(&totalRevenue)
	stats["total_revenue"] = totalRevenue

	var uniquePaths int64
	l.db.QueryRow("SELECT COUNT(DISTINCT path) FROM serve_events").Scan(&uniquePaths)
	stats["unique_paths"] = uniquePaths

	return stats, nil
}

// Close closes the ledger database
func (l *Ledger) Close() error {
	return l.db.Close()
}

// PutInvoice stores a pending invoice
func (l *Ledger) PutInvoice(inv Invoice) error {
	_, err := l.db.Exec(`
		INSERT OR REPLACE INTO invoices (nonce, path, amount, expires)
		VALUES (?, ?, ?, ?)
	`, inv.Nonce, inv.Path, inv.Amount, inv.Expires)
	return err
}

// GetInvoice fetches a pending invoice by nonce
func (l *Ledger) GetInvoice(nonce string) (*Invoice, error) {
	var inv Invoice
	err := l.db.QueryRow(`
		SELECT nonce, path, amount, expires
		FROM invoices
		WHERE nonce = ?
	`, nonce).Scan(&inv.Nonce, &inv.Path, &inv.Amount, &inv.Expires)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

// DeleteInvoice removes a pending invoice
func (l *Ledger) DeleteInvoice(nonce string) error {
	_, err := l.db.Exec(`DELETE FROM invoices WHERE nonce = ?`, nonce)
	return err
}

// PruneExpiredInvoices deletes all expired invoices
func (l *Ledger) PruneExpiredInvoices(now int64) error {
	_, err := l.db.Exec(`DELETE FROM invoices WHERE expires <= ?`, now)
	return err
}
