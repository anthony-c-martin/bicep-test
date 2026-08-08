module github.com/anthony-c-martin/bicep-test/samples/go

go 1.24

require github.com/anthony-c-martin/bicep-test/packages/go v0.0.0

require (
	github.com/Microsoft/go-winio v0.6.2 // indirect
	golang.org/x/sys v0.10.0 // indirect
)

replace github.com/anthony-c-martin/bicep-test/packages/go => ../../packages/go
