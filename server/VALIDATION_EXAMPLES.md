# Request Validation Examples

## Testing Validation

### ✅ Valid Request

```bash
POST /api/incidents
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "title": "Fire at Main Street",
  "description": "Large fire reported at Main Street. Multiple fire trucks needed.",
  "type": "fire",
  "severity": "critical",
  "location": {
    "address": "123 Main Street, City",
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

**Response: 201 Created**

---

### ❌ Invalid Requests & Error Messages

#### 1. Missing Required Field

```bash
POST /api/incidents
{
  "description": "Fire reported",
  "type": "fire",
  "severity": "critical"
}
```

**Response: 400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 5 characters"
    },
    {
      "field": "location",
      "message": "Required"
    }
  ]
}
```

#### 2. Invalid Enum Value

```bash
POST /api/incidents
{
  "title": "Test incident",
  "description": "Test description here",
  "type": "robbery",  // ❌ Not in enum
  "severity": "critical",
  "location": { ... }
}
```

**Response: 400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "type",
      "message": "Invalid incident type"
    }
  ]
}
```

#### 3. Invalid Coordinates

```bash
POST /api/incidents
{
  "title": "Test incident",
  "description": "Test description here",
  "type": "fire",
  "severity": "critical",
  "location": {
    "address": "Test Address",
    "lat": 95,      // ❌ Out of range
    "lng": -200     // ❌ Out of range
  }
}
```

**Response: 400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "location.lat",
      "message": "Latitude must be between -90 and 90"
    },
    {
      "field": "location.lng",
      "message": "Longitude must be between -180 and 180"
    }
  ]
}
```

#### 4. Weak Password (Signup)

```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "weak"  // ❌ Too short, no uppercase, no number
}
```

**Response: 400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    },
    {
      "field": "password",
      "message": "Password must contain at least one number"
    }
  ]
}
```

#### 5. Invalid Email

```bash
POST /api/auth/login
{
  "email": "not-an-email",  // ❌ Invalid format
  "password": "Password123"
}
```

**Response: 400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

#### 6. Invalid MongoDB ObjectID

```bash
GET /api/incidents/invalid-id  // ❌ Not 24 hex characters
```

**Response: 400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "params.id",
      "message": "Invalid incident ID format"
    }
  ]
}
```

#### 7. Invalid Phone Number

```bash
POST /api/emergency-contacts
{
  "name": "Emergency Contact",
  "phone": "abc-123",  // ❌ Invalid format
  "relationship": "Friend"
}
```

**Response: 400 Bad Request**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ]
}
```

---

## Testing with cURL

### Valid Incident Report
```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Medical Emergency",
    "description": "Person collapsed on street, needs immediate medical attention",
    "type": "medical",
    "severity": "critical",
    "location": {
      "address": "456 Oak Street",
      "lat": 40.7128,
      "lng": -74.0060
    }
  }'
```

### Test Validation Failure
```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Bad",
    "description": "Short",
    "type": "invalid-type",
    "severity": "extreme"
  }'
```

---

## What Gets Validated

### ✓ Field Types
- Strings, numbers, booleans, objects, arrays

### ✓ String Constraints
- Min/max length
- Email format
- Phone format
- URL format
- Regex patterns

### ✓ Number Constraints
- Min/max values
- Integer vs float
- Coordinate ranges

### ✓ Enum Values
- Predefined options only
- Case-sensitive matching

### ✓ Object Structure
- Required fields
- Nested validation
- Optional fields

### ✓ Array Validation
- Item type checking
- Min/max items
- Unique items

### ✓ Custom Rules
- Password strength
- MongoDB ObjectID format
- Coordinate validation
- Phone number format
