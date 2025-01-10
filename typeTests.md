Scenario 1: Time is outside validity limits

{
  "pinCode": "5678",
  "doorIds": ["garage"],
  "restrictions": [
    {
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-06-01T23:59:59Z"
    }
  ]
}

{
  "pinCode": "5678",
  "simulatedTimestamp": "2024-06-15T10:00:00Z"
}

================================================================================

Scenario 2: The PIN code is not registered for the specific door

{
  "pinCode": "8765",
  "doorIds": ["main"],
  "restrictions": [
    {
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z"
    }
  ]
}

{
  "pinCode": "8765",
  "simulatedTimestamp": "2024-06-15T10:00:00Z"
}

================================================================================

Scenario 3: Invalid PIN

URL: http://localhost:3000/doors/garage

{
  "pinCode": "9999",
  "simulatedTimestamp": "2024-06-15T10:00:00Z"
}

false

================================================================================

Scenario 4: Time is before the validity start date

{
  "pinCode": "4321",
  "doorIds": ["garage"],
  "restrictions": [
    {
      "validFrom": "2024-07-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z"
    }
  ]
}

{
  "pinCode": "4321",
  "simulatedTimestamp": "2024-06-15T10:00:00Z"
}

false
