```mermaid
%%{init: {'themeVariables': { 'classTextSize': '20px', 'fontSize': '20px', 'classBoxWidth': 500, 'classBoxHeight': 300 }}}%%
classDiagram
    class AccessRequestController {
        +getDoors(): Promise<any>
        +validateAccessRequest(doorId: string, accessRequest: AccessRequestDto): Promise<any>
    }
    class PinCodeRegistrationController {
        getPinCodeRegistration(): Promise<PinCodeRegistrationDto[]>
        registerPinCodeRegistration(pinCodeRegistration: PinCodeRegistrationDto): Promise<any>
        updatePinCodeRegistration(pinCode: string, pinCodeRegistration: PinCodeRegistrationDto): Promise<any>
        revokePinCodeRegistration(pinCode: string): Promise<any>
    }
    class PinCodeRegistrationService {
        +getRegistrations(): Promise<PinCodeRegistration[]>
        +registerPinCodeAuthorizations(userId: string, registration: PinCodeRegistration): Promise<any>
        +updatePinCodeAuthorizations(userId: string, registration: PinCodeRegistration): Promise<any>
        +revokePinCodeAuthorizations(userId: string, pinCode: string): Promise<any>
        +validateAccess(userId: string, pinCode: string, doorId: string, date: Date): Promise<boolean>
        +getAllRegistrationsForUser(userId: string): Promise<PinCodeRegistration[]>
        -findRegistration(userId: string, pinCode: string): Promise<PinCodeRegistrationEntity>
        -deleteRegistration(userId: string, pinCode: string): Promise<void>
        -validateDoors(doorIds: string[]): Promise<void>
    }
    class PinCodeRegistrationRepository {
        +savePinCodeRegistration(registration: PinCodeRegistrationEntity): Promise<void>
        +findAll(): Promise<PinCodeRegistrationEntity[]>
        +deletePinCodeRegistration(userId: string, pinCode: string): Promise<void>
        +getRegistration(userId: string, pinCode: string): Promise<PinCodeRegistrationEntity | null>
        +isPinValidForDoor(pin: string, door: string, dateTime: Date): Promise<boolean>
        +getUserRegistrations(userId: string): PinCodeRegistrationEntity[]
        -findByPinCode(pinCode: string): Promise<PinCodeRegistrationEntity | null>
        -findRegistrationByPinCode(userRegistrations: PinCodeRegistrationEntity[], pinCode: string): PinCodeRegistrationEntity | null
        -removePinCode(userRegistrations: PinCodeRegistrationEntity[], userId: string, pinCode: string): void
        -removeUser(userId: string): void
        +validateRegistration(fetchRegistration: () => Promise<PinCodeRegistrationEntity | null>, doorId: string, date: Date): Promise<boolean>
        -isValidRegistration(registration: PinCodeRegistrationEntity | null, doorId: string, date: Date): boolean
        -isDateWithinRestrictions(restrictions: Restrictions[], date: Date): boolean
    }
    class DoorService {
        +getDoors(): Promise<any>
        +validateAccessRequest(doorId: string, pinCode: string, simulatedTimestamp: Date): Promise<boolean>
    }
    class Logger {
        log(message: string)
    }
    class ErrorHandler {
        handleError(error: Error)
    }

    class Restrictions {
        +validFrom?: Date
        +validTo?: Date
    }

    class PinCodeRegistrationEntity {
        +id?: string
        +registeredBy: string
        +pinCode: string
        +doorIds: string[]
        +restrictions?: AccessRestrictions[]
    }

    class PinCodeRegistration {
        +pinCode: string
        +doorIds: string[]
        +restrictions?: AccessRestrictions[]
    }

    class AccessRestrictions {
        +validFrom?: Date
        +validTo?: Date
    }

    class AuthorizedPinCode {
        +pinCode: string
        +restrictions?: AccessRestrictions[]
    }

    class DoorEntity {
        +id: string
        +name: string
        +authorizedPinCodes: AuthorizedPinCode[]
    }

    class ApiError {
        +statusCode: number
        +status: string
        +errors?: ApiErrorDetail[]
        +constructor(statusCode: number, message: string, status: string)
    }

    class SecurityFeatures {
        +helmet(): void
        +frameguard(action: string): void
        +contentSecurityPolicy(options: CSPOptions): void
        +rateLimiting(): void
        +enableCors(options: CorsOptions): void
        +createValidationPipe(): ValidationPipe
        +GlobalErrorHandler(logger: Logger): ErrorHandler
    }

    %% add nodes 
    note for PinCodeRegistrationService "Method 'getRegistrations' is decorated with @CacheResult(ttl: 120, cacheId: 'user-registrations')."

    %% add nodes
    note for PinCodeRegistrationService "Method 'revokePinCodeAuthorizations' is decorated with @ClearCache(cacheId: 'user-registrations')."

    PinCodeRegistrationEntity --> AccessRestrictions : uses
    PinCodeRegistration --> AccessRestrictions : uses
    AuthorizedPinCode --> AccessRestrictions : uses
    DoorEntity --> AuthorizedPinCode : contains

    PinCodeRegistrationController --> PinCodeRegistrationService
    PinCodeRegistrationService --> PinCodeRegistrationRepository
    AccessRequestController --> DoorService
    PinCodeRegistrationService --> Logger
    DoorService --> PinCodeRegistrationRepository
    PinCodeRegistrationService --> ApiError : throws
    PinCodeRegistrationRepository --> ApiError : throws

