```mermaid
flowchart TD
    subgraph Controllers
        ARC[AccessRequestController]
        PRC[PinCodeRegistrationController]
    end

    subgraph Services
        PRS[PinCodeRegistrationService]
        DS[DoorService]
    end

    subgraph Repositories
        PRR[PinCodeRegistrationRepository]
    end

    subgraph Models
        PCE[PinCodeRegistrationEntity]
        AR[AccessRestrictions]
        APC[AuthorizedPinCode]
        DE[DoorEntity]
    end

    subgraph Helpers
        LF[Logger]
        EH[ErrorHandler]
        AE[ApiError]
    end

    subgraph SecurityFeatures
        SF[SecurityFeatures]
    end

    %% Връзки
    ARC --> DS
    PRC --> PRS
    PRS --> PRR
    PRR --> PCE
    PCE --> AR
    DE --> APC
    APC --> AR

    PRS --> LF
    PRS --> AE
    PRR --> AE
    DS --> PRR
    SF --> ARC
    SF --> PRC
