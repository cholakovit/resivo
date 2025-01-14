```mermaid
flowchart TD
    Start[User sends request] -->|Access Validation| AccessRequestController
    AccessRequestController -->|Check door ID| DoorService
    AccessRequestController -->|Check PIN validity| PinCodeRegistrationService
    PinCodeRegistrationService -->|Fetch PIN from DB| PinCodeRegistrationRepository
    PinCodeRegistrationService --> Logger
    AccessRequestController -->|Return Result| End[Door opens or access denied]

    subgraph PIN Registration Flow
        A[User registers PIN] --> B[PinCodeRegistrationController]
        B --> C[PinCodeRegistrationService]
        C --> D[Save PIN in DB]
        C --> Logger
        D --> EndPIN[PIN successfully registered]
    end
