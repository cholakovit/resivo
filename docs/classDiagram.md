```mermaid
classDiagram
    class AccessRequestController {
        validateAccess(pin: string, door: string, dateTime: Date): boolean
    }
    class PinCodeRegistrationController {
        createPin(pin: string, doors: string[], restrictions: Restrictions)
        updatePin(pin: string, doors: string[], restrictions: Restrictions)
        deletePin(pin: string)
    }
    class PinCodeRegistrationService {
        savePin(data: PinData)
        getPin(pin: string): PinData
        deletePin(pin: string)
    }
    class PinCodeRegistrationRepository {
        save(data: PinData)
        find(pin: string): PinData
        delete(pin: string)
    }
    class DoorService {
        getDoor(id: string): Door
    }
    class Logger {
        log(message: string)
    }
    class ErrorHandler {
        handleError(error: Error)
    }

    AccessRequestController --> PinCodeRegistrationService
    PinCodeRegistrationController --> PinCodeRegistrationService
    PinCodeRegistrationService --> PinCodeRegistrationRepository
    AccessRequestController --> DoorService
    PinCodeRegistrationService --> Logger
    AccessRequestController --> Logger
    AccessRequestController --> ErrorHandler
