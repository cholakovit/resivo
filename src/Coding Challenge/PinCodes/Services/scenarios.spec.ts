import { PinCodeRegistrationRepository } from "../Repositories/PinCodeRegistrationRepository";

describe("Scenarios", () => {
  let repository: PinCodeRegistrationRepository;

  beforeEach(() => {
    repository = new PinCodeRegistrationRepository();
  });

  it("should not validate PIN if time is outside validity limits (Scenario 1)", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "5678",
      doorIds: ["garage"],
      restrictions: [
        {
          validFrom: new Date("2024-01-01T00:00:00Z"),
          validTo: new Date("2024-06-01T23:59:59Z"),
        },
      ],
    };

    await repository.savePinCodeRegistration(registration);

    const isValid = await repository.isPinValidForDoor(
      "5678",
      "garage",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(false);
  });

  it("should not validate PIN if not registered for specific door (Scenario 2)", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "8765",
      doorIds: ["main"],
      restrictions: [
        {
          validFrom: new Date("2024-01-01T00:00:00Z"),
          validTo: new Date("2024-12-31T23:59:59Z"),
        },
      ],
    };

    await repository.savePinCodeRegistration(registration);

    const isValid = await repository.isPinValidForDoor(
      "8765",
      "garage",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(false);
  });

  it("should not validate invalid PIN code (Scenario 3)", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "1234",
      doorIds: ["garage"],
      restrictions: [],
    };

    await repository.savePinCodeRegistration(registration);

    const isValid = await repository.isPinValidForDoor(
      "9999",
      "garage",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(false);
  });

  it("should not validate PIN if time is before the validity start date (Scenario 4)", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "4321",
      doorIds: ["garage"],
      restrictions: [
        {
          validFrom: new Date("2024-07-01T00:00:00Z"),
          validTo: new Date("2024-12-31T23:59:59Z"),
        },
      ],
    };

    await repository.savePinCodeRegistration(registration);

    const isValid = await repository.isPinValidForDoor(
      "4321",
      "garage",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(false);
  });

  it("should validate PIN for a door within the validity period (Success Scenario)", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "1111",
      doorIds: ["garage"],
      restrictions: [
        {
          validFrom: new Date("2024-01-01T00:00:00Z"),
          validTo: new Date("2024-12-31T23:59:59Z"),
        },
      ],
    };
  
    await repository.savePinCodeRegistration(registration);
  
    const isValid = await repository.isPinValidForDoor(
      "1111",
      "garage",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(true);
  });

  it("should validate PIN without restrictions (24/7 validity)", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "2222",
      doorIds: ["main"],
      restrictions: [],
    };
  
    await repository.savePinCodeRegistration(registration);
  
    const isValid = await repository.isPinValidForDoor(
      "2222",
      "main",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(true);
  });

  it("should validate PIN for a door with only end date restriction", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "3333",
      doorIds: ["spa"],
      restrictions: [
        {
          validTo: new Date("2024-12-31T23:59:59Z"),
        },
      ],
    };
  
    await repository.savePinCodeRegistration(registration);
  
    const isValid = await repository.isPinValidForDoor(
      "3333",
      "spa",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(true);
  });

  it("should validate PIN for a door with only start date restriction", async () => {
    const registration = {
      registeredBy: "peter",
      pinCode: "4444",
      doorIds: ["gym"],
      restrictions: [
        {
          validFrom: new Date("2024-01-01T00:00:00Z"),
        },
      ],
    };
  
    await repository.savePinCodeRegistration(registration);
  
    const isValid = await repository.isPinValidForDoor(
      "4444",
      "gym",
      new Date("2024-06-15T10:00:00Z")
    );
    expect(isValid).toBe(true);
  });
});
