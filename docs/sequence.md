```mermaid
sequenceDiagram
    participant User
    participant AccessRequestController
    participant DoorService
    participant PinCodeRegistrationService
    participant PinCodeRegistrationRepository
    participant Logger

    User->>AccessRequestController: Sends access request (PIN, door, datetime)
    AccessRequestController->>DoorService: Validate door ID
    DoorService-->>AccessRequestController: Door validation result
    AccessRequestController->>PinCodeRegistrationService: Check PIN validity
    PinCodeRegistrationService->>PinCodeRegistrationRepository: Fetch PIN details
    PinCodeRegistrationRepository-->>PinCodeRegistrationService: PIN details
    PinCodeRegistrationService-->>AccessRequestController: PIN validation result
    AccessRequestController->>Logger: Log access attempt
    AccessRequestController-->>User: Returns access result (granted/denied)
