// Package pricing implements $PATH pricing curves
package pricing

import (
	"fmt"
	"math"
)

// Curve represents a pricing curve type
type Curve string

const (
	SqrtDecay   Curve = "sqrt_decay"
	Fixed       Curve = "fixed"
	LogDecay    Curve = "log_decay"
	LinearFloor Curve = "linear_floor"
)

// Calculator computes prices based on supply and curve
type Calculator struct {
	BasePrice   int64
	Curve       Curve
	Supply      int64
	MaxSupply   *int64
	FloorPrice  int64 // for linear_floor
	DecayRate   int64 // for linear_floor
}

// NewCalculator creates a price calculator with the given parameters
func NewCalculator(basePrice int64, curve Curve, supply int64) *Calculator {
	return &Calculator{
		BasePrice: basePrice,
		Curve:     curve,
		Supply:    supply,
	}
}

// CurrentPrice returns the price at the current supply level
func (c *Calculator) CurrentPrice() int64 {
	return c.PriceAtSupply(c.Supply)
}

// PriceAtSupply returns the price at a specific supply level
func (c *Calculator) PriceAtSupply(supply int64) int64 {
	switch c.Curve {
	case SqrtDecay:
		// price = base / sqrt(supply + 1)
		return int64(float64(c.BasePrice) / math.Sqrt(float64(supply+1)))

	case Fixed:
		return c.BasePrice

	case LogDecay:
		// price = base / log(supply + 2)
		return int64(float64(c.BasePrice) / math.Log(float64(supply+2)))

	case LinearFloor:
		// price = max(floor, base - (supply * decay_rate))
		price := c.BasePrice - (supply * c.DecayRate)
		if price < c.FloorPrice {
			return c.FloorPrice
		}
		return price

	default:
		// Default to sqrt_decay
		return int64(float64(c.BasePrice) / math.Sqrt(float64(supply+1)))
	}
}

// TotalCost returns the total cost to acquire `amount` tokens at current supply
func (c *Calculator) TotalCost(amount int64) int64 {
	var total int64
	for i := int64(0); i < amount; i++ {
		total += c.PriceAtSupply(c.Supply + i)
	}
	return total
}

// PriceSchedule returns prices for the next N supply levels
func (c *Calculator) PriceSchedule(count int) []PricePoint {
	points := make([]PricePoint, count)
	var cumulative int64
	for i := 0; i < count; i++ {
		supply := c.Supply + int64(i)
		price := c.PriceAtSupply(supply)
		cumulative += price
		points[i] = PricePoint{
			Supply:     supply,
			UnitPrice:  price,
			Cumulative: cumulative,
		}
	}
	return points
}

// PricePoint represents a single point on the price schedule
type PricePoint struct {
	Supply     int64 `json:"supply"`
	UnitPrice  int64 `json:"unit_price"`
	Cumulative int64 `json:"cumulative"`
}

// Split calculates the revenue split for a payment
type Split struct {
	Total       int64
	IssuerShare int64
	ServerShare int64
}

// CalculateSplit divides payment between issuer and server
func CalculateSplit(total int64, issuerRatio, serverRatio float64) Split {
	issuerShare := int64(float64(total) * issuerRatio)
	serverShare := total - issuerShare // Server gets the remainder to avoid rounding loss
	return Split{
		Total:       total,
		IssuerShare: issuerShare,
		ServerShare: serverShare,
	}
}

// ParseCurve converts a string to a Curve type
func ParseCurve(s string) (Curve, error) {
	switch s {
	case "sqrt_decay", "":
		return SqrtDecay, nil
	case "fixed":
		return Fixed, nil
	case "log_decay":
		return LogDecay, nil
	case "linear_floor":
		return LinearFloor, nil
	default:
		return "", fmt.Errorf("unknown pricing curve: %s", s)
	}
}
