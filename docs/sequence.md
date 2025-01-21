```mermaid
sequenceDiagram
    participant Client as Client
    participant ARC as AccessRequestController
    participant DS as DoorService
    participant PRC as PinCodeRegistrationController
    participant PRS as PinCodeRegistrationService
    participant PRR as PinCodeRegistrationRepository
    participant PCE as PinCodeRegistrationEntity
    participant AR as AccessRestrictions
    participant AE as ApiError
    participant SF as SecurityFeatures

    %% Flow for AccessRequestController
    Client->>ARC: validateAccessRequest(doorId, accessRequest)
    ARC->>DS: validateAccessRequest(doorId, pinCode, timestamp)
    DS->>PRR: isPinValidForDoor(pinCode, doorId, timestamp)
    PRR->>PCE: Check if pinCode is valid
    PCE-->>PRR: Valid/Invalid
    PRR-->>DS: Result
    DS-->>ARC: Access Granted/Denied
    ARC-->>Client: Response

    %% Flow for PinCodeRegistrationController
    Client->>PRC: registerPinCodeRegistration(pinCodeRegistration)
    PRC->>PRS: registerPinCodeAuthorizations(userId, registration)
    PRS->>PRR: savePinCodeRegistration(registration)
    PRR->>PCE: Save registration data
    PCE-->>PRR: Success
    PRR-->>PRS: Registration Saved
    PRS-->>PRC: Registration Successful
    PRC-->>Client: Response

    %% Flow for Error
    PRS->>PRR: getRegistration(userId, pinCode)
    PRR->>AE: throw ApiError if registration not found
    AE-->>PRS: Error response
    PRS-->>PRC: Error
    PRC-->>Client: Error Response
