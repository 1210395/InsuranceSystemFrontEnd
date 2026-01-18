# Birzeit University Insurance System - PlantUML Diagrams

## 1. Entity Relationship Diagram (ER Diagram)

```plantuml
@startuml ER_Diagram
!define TABLE(x) class x << (T,#FFAAAA) >>
!define PRIMARY_KEY(x) <u>x</u>
!define FOREIGN_KEY(x) <i>x</i>

skinparam class {
    BackgroundColor White
    BorderColor #0D3B66
    ArrowColor #0D3B66
}

TABLE(clients) {
    PRIMARY_KEY(id) : UUID
    --
    password_hash : VARCHAR(255)
    full_name : VARCHAR(150)
    email : VARCHAR(150) <<unique>>
    phone : VARCHAR(40)
    employee_id : VARCHAR(50) <<unique>>
    national_id : VARCHAR(20) <<unique>>
    department : VARCHAR(150)
    faculty : VARCHAR(150)
    specialization : VARCHAR(150)
    clinic_location : VARCHAR(200)
    pharmacy_code : VARCHAR(50)
    pharmacy_name : VARCHAR(150)
    lab_code : VARCHAR(50)
    lab_name : VARCHAR(150)
    radiology_code : VARCHAR(50)
    radiology_name : VARCHAR(150)
    date_of_birth : DATE
    gender : VARCHAR(10)
    status : ENUM(MemberStatus)
    requested_role : ENUM(RoleName)
    role_request_status : ENUM(RoleRequestStatus)
    email_verified : BOOLEAN
    FOREIGN_KEY(policy_id) : UUID
    created_at : TIMESTAMP
    updated_at : TIMESTAMP
}

TABLE(roles) {
    PRIMARY_KEY(id) : UUID
    --
    name : ENUM(RoleName)
    description : TEXT
}

TABLE(client_roles) {
    FOREIGN_KEY(client_id) : UUID
    FOREIGN_KEY(role_id) : UUID
}

TABLE(policies) {
    PRIMARY_KEY(id) : UUID
    --
    policy_no : VARCHAR(50) <<unique>>
    name : VARCHAR(120)
    description : TEXT
    start_date : DATE
    end_date : DATE
    status : ENUM(PolicyStatus)
    coverage_limit : DECIMAL(12,2)
    deductible : DECIMAL(12,2)
    emergency_rules : TEXT
    created_at : TIMESTAMP
    updated_at : TIMESTAMP
}

TABLE(coverages) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(policy_id) : UUID
    coverage_type : ENUM(CoverageType)
    percentage : DECIMAL(5,2)
    max_amount : DECIMAL(12,2)
    description : TEXT
}

TABLE(healthcare_provider_claims) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(provider_id) : UUID
    FOREIGN_KEY(client_id) : UUID
    FOREIGN_KEY(policy_id) : UUID
    client_name : VARCHAR(150)
    description : TEXT
    diagnosis : TEXT
    treatment_details : TEXT
    amount : DECIMAL(12,2)
    service_date : DATE
    status : ENUM(ClaimStatus)
    note right: PENDING_MEDICAL, APPROVED_BY_MEDICAL,
    note right: REJECTED_BY_MEDICAL, RETURNED_FOR_REVIEW,
    note right: APPROVED_FINAL, REJECTED_FINAL
    provider_role : VARCHAR(50)
    invoice_image_path : VARCHAR(500)
    rejection_reason : TEXT
    is_covered : BOOLEAN
    insurance_covered_amount : DECIMAL(12,2)
    client_pay_amount : DECIMAL(12,2)
    is_follow_up : BOOLEAN
    FOREIGN_KEY(medical_reviewer_id) : UUID
    FOREIGN_KEY(coordination_reviewer_id) : UUID
    medical_reviewer_name : VARCHAR(150)
    coordination_reviewer_name : VARCHAR(150)
    submitted_at : TIMESTAMP
    medical_reviewed_at : TIMESTAMP
    coordination_reviewed_at : TIMESTAMP
    approved_at : TIMESTAMP
    rejected_at : TIMESTAMP
}

TABLE(prescriptions) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(doctor_id) : UUID
    FOREIGN_KEY(member_id) : UUID
    FOREIGN_KEY(pharmacist_id) : UUID
    status : ENUM(PrescriptionStatus)
    note right: PENDING, VERIFIED, BILLED, REJECTED
    diagnosis : TEXT
    treatment : TEXT
    total_price : DECIMAL(12,2)
    is_chronic : BOOLEAN
    rejection_reason : TEXT
    created_at : TIMESTAMP
    updated_at : TIMESTAMP
}

TABLE(prescription_items) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(prescription_id) : UUID
    FOREIGN_KEY(price_id) : UUID
    medication_name : VARCHAR(200)
    dosage : VARCHAR(100)
    frequency : VARCHAR(100)
    duration : VARCHAR(50)
    quantity : INTEGER
    unit_price : DECIMAL(10,2)
    total_price : DECIMAL(10,2)
}

TABLE(lab_requests) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(doctor_id) : UUID
    FOREIGN_KEY(member_id) : UUID
    FOREIGN_KEY(lab_tech_id) : UUID
    FOREIGN_KEY(price_id) : UUID
    test_name : VARCHAR(200)
    notes : TEXT
    result_url : VARCHAR(500)
    status : ENUM(LabRequestStatus)
    note right: PENDING, COMPLETED, REJECTED
    diagnosis : TEXT
    treatment : TEXT
    entered_price : DECIMAL(10,2)
    approved_price : DECIMAL(10,2)
    rejection_reason : TEXT
    created_at : TIMESTAMP
    updated_at : TIMESTAMP
}

TABLE(radiology_requests) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(doctor_id) : UUID
    FOREIGN_KEY(member_id) : UUID
    FOREIGN_KEY(radiologist_id) : UUID
    FOREIGN_KEY(price_id) : UUID
    scan_type : VARCHAR(200)
    notes : TEXT
    result_url : VARCHAR(500)
    status : ENUM(RadiologyRequestStatus)
    note right: PENDING, COMPLETED, REJECTED
    diagnosis : TEXT
    treatment : TEXT
    entered_price : DECIMAL(10,2)
    approved_price : DECIMAL(10,2)
    rejection_reason : TEXT
    created_at : TIMESTAMP
    updated_at : TIMESTAMP
}

TABLE(emergency_requests) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(client_id) : UUID
    FOREIGN_KEY(doctor_id) : UUID
    FOREIGN_KEY(reviewed_by) : UUID
    description : TEXT
    location : VARCHAR(500)
    contact_phone : VARCHAR(40)
    status : ENUM(EmergencyStatus)
    note right: PENDING_MEDICAL, APPROVED_BY_MEDICAL,
    note right: REJECTED_BY_MEDICAL
    rejection_reason : TEXT
    created_at : TIMESTAMP
    reviewed_at : TIMESTAMP
}

TABLE(family_members) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(client_id) : UUID
    full_name : VARCHAR(150)
    national_id : VARCHAR(20) <<unique>>
    insurance_number : VARCHAR(30) <<unique>>
    relation : ENUM(FamilyRelation)
    gender : ENUM(Gender)
    age : INTEGER
    date_of_birth : DATE
    status : ENUM(FamilyMemberStatus)
    note right: PENDING, APPROVED, REJECTED
    rejection_reason : TEXT
    created_at : TIMESTAMP
}

TABLE(search_profiles) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(owner_id) : UUID
    profile_type : ENUM(SearchProfileType)
    note right: DOCTOR, PHARMACIST, LAB, RADIOLOGY
    name : VARCHAR(150)
    specialization : VARCHAR(150)
    location_lat : DECIMAL(10,8)
    location_lng : DECIMAL(11,8)
    address : VARCHAR(500)
    phone : VARCHAR(40)
    working_hours : VARCHAR(200)
    document_path : VARCHAR(500)
    status : ENUM(ProfileStatus)
    note right: PENDING, APPROVED, REJECTED
    rejection_reason : TEXT
    created_at : TIMESTAMP
}

TABLE(notifications) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(recipient_id) : UUID
    title : VARCHAR(200)
    message : TEXT
    type : ENUM(NotificationType)
    is_read : BOOLEAN
    created_at : TIMESTAMP
}

TABLE(price_list) {
    PRIMARY_KEY(id) : UUID
    --
    service_type : ENUM(ServiceType)
    note right: LAB, PHARMACY, RADIOLOGY
    service_name : VARCHAR(200)
    union_price : DECIMAL(10,2)
    description : TEXT
    is_active : BOOLEAN
    created_at : TIMESTAMP
}

TABLE(medical_records) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(member_id) : UUID
    blood_type : VARCHAR(10)
    allergies : TEXT
    chronic_conditions : TEXT
    current_medications : TEXT
    medical_history : TEXT
    notes : TEXT
    created_at : TIMESTAMP
    updated_at : TIMESTAMP
}

TABLE(doctor_specializations) {
    PRIMARY_KEY(id) : UUID
    --
    name : VARCHAR(150)
    description : TEXT
    max_visits_per_year : INTEGER
    is_active : BOOLEAN
    created_at : TIMESTAMP
}

TABLE(chat_messages) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(sender_id) : UUID
    FOREIGN_KEY(recipient_id) : UUID
    message : TEXT
    is_read : BOOLEAN
    created_at : TIMESTAMP
}

TABLE(chronic_patient_schedules) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(client_id) : UUID
    disease : ENUM(ChronicDisease)
    next_visit_date : DATE
    last_prescription_date : DATE
    notes : TEXT
}

TABLE(visits) {
    PRIMARY_KEY(id) : UUID
    --
    FOREIGN_KEY(doctor_id) : UUID
    FOREIGN_KEY(patient_id) : UUID
    visit_date : DATE
    diagnosis : TEXT
    treatment : TEXT
    notes : TEXT
    created_at : TIMESTAMP
}

' Relationships
clients ||--o{ client_roles
roles ||--o{ client_roles
policies ||--o{ clients
policies ||--o{ coverages
clients ||--o{ healthcare_provider_claims : "as provider"
clients ||--o{ healthcare_provider_claims : "as client"
clients ||--o{ prescriptions : "as doctor"
clients ||--o{ prescriptions : "as member"
clients ||--o{ prescriptions : "as pharmacist"
prescriptions ||--o{ prescription_items
clients ||--o{ lab_requests : "as doctor"
clients ||--o{ lab_requests : "as member"
clients ||--o{ lab_requests : "as lab_tech"
clients ||--o{ radiology_requests : "as doctor"
clients ||--o{ radiology_requests : "as member"
clients ||--o{ radiology_requests : "as radiologist"
clients ||--o{ emergency_requests : "as client"
clients ||--o{ emergency_requests : "as doctor"
clients ||--o{ family_members
clients ||--o{ search_profiles
clients ||--o{ notifications
clients ||--o{ chronic_patient_schedules
clients ||--o{ visits : "as doctor"
clients ||--o{ visits : "as patient"
clients ||--o{ medical_records
clients ||--o{ chat_messages : "as sender"
clients ||--o{ chat_messages : "as recipient"
price_list ||--o{ prescription_items
price_list ||--o{ lab_requests
price_list ||--o{ radiology_requests
policies ||--o{ healthcare_provider_claims
doctor_specializations ||--o{ search_profiles

@enduml
```

---

## 2. Use Case Diagram

```plantuml
@startuml Use_Case_Diagram
left to right direction
skinparam actorStyle awesome
skinparam packageStyle rectangle
skinparam usecase {
    BackgroundColor #E8F5E9
    BorderColor #0D3B66
    ArrowColor #0D3B66
}

actor "Insurance Client" as Client #LightBlue
actor "Doctor" as Doctor #LightGreen
actor "Pharmacist" as Pharmacist #LightYellow
actor "Lab Technician" as LabTech #LightCoral
actor "Radiologist" as Radiologist #LightPink
actor "Medical Admin" as MedAdmin #Orange
actor "Coordination Admin" as CoordAdmin #Violet
actor "Insurance Manager" as Manager #Gold
actor "Emergency Manager" as EmergManager #Red

rectangle "Birzeit University Insurance System" {

    package "Authentication" {
        usecase "Register Account" as UC_Register
        usecase "Login" as UC_Login
        usecase "Reset Password" as UC_ResetPass
        usecase "Verify Email" as UC_VerifyEmail
    }

    package "Claims Management" {
        usecase "Submit Claim" as UC_SubmitClaim
        usecase "View My Claims" as UC_ViewClaims
        usecase "Review Claim (Medical)" as UC_ReviewMedical
        usecase "Review Claim (Coordination)" as UC_ReviewCoord
        usecase "Approve/Reject Claim" as UC_ApproveReject
        usecase "Return Claim for Review" as UC_ReturnClaim
        usecase "View All Claims" as UC_ViewAllClaims
    }

    package "Prescription Management" {
        usecase "Create Prescription" as UC_CreateRx
        usecase "View Prescriptions" as UC_ViewRx
        usecase "Fulfill Prescription" as UC_FulfillRx
        usecase "Track Prescription Status" as UC_TrackRx
    }

    package "Lab Requests" {
        usecase "Create Lab Request" as UC_CreateLab
        usecase "View Lab Requests" as UC_ViewLab
        usecase "Process Lab Request" as UC_ProcessLab
        usecase "Enter Lab Results" as UC_EnterLabResults
    }

    package "Radiology Requests" {
        usecase "Create Radiology Request" as UC_CreateRad
        usecase "View Radiology Requests" as UC_ViewRad
        usecase "Process Radiology Request" as UC_ProcessRad
        usecase "Enter Radiology Results" as UC_EnterRadResults
    }

    package "Healthcare Provider Network" {
        usecase "Search Providers" as UC_SearchProviders
        usecase "View Provider on Map" as UC_ViewMap
        usecase "Register as Provider" as UC_RegisterProvider
        usecase "Manage Provider Profiles" as UC_ManageProviders
    }

    package "Emergency Management" {
        usecase "Submit Emergency Request" as UC_SubmitEmerg
        usecase "Review Emergency Request" as UC_ReviewEmerg
        usecase "Approve Emergency" as UC_ApproveEmerg
    }

    package "Family Management" {
        usecase "Add Family Member" as UC_AddFamily
        usecase "View Family Members" as UC_ViewFamily
        usecase "Approve Family Member" as UC_ApproveFamily
    }

    package "Administration" {
        usecase "Manage Policies" as UC_ManagePolicies
        usecase "Manage Users" as UC_ManageUsers
        usecase "View Reports" as UC_ViewReports
        usecase "Manage Price List" as UC_ManagePrices
        usecase "Manage Chronic Patients" as UC_ManageChronic
    }

    package "Notifications" {
        usecase "View Notifications" as UC_ViewNotif
        usecase "Send Notifications" as UC_SendNotif
    }
}

' Client relationships
Client --> UC_Register
Client --> UC_Login
Client --> UC_SubmitClaim
Client --> UC_ViewClaims
Client --> UC_ViewRx
Client --> UC_TrackRx
Client --> UC_ViewLab
Client --> UC_ViewRad
Client --> UC_SearchProviders
Client --> UC_ViewMap
Client --> UC_SubmitEmerg
Client --> UC_AddFamily
Client --> UC_ViewFamily
Client --> UC_ViewNotif

' Doctor relationships
Doctor --> UC_Login
Doctor --> UC_CreateRx
Doctor --> UC_CreateLab
Doctor --> UC_CreateRad
Doctor --> UC_SubmitClaim
Doctor --> UC_RegisterProvider
Doctor --> UC_SubmitEmerg
Doctor --> UC_ViewNotif

' Pharmacist relationships
Pharmacist --> UC_Login
Pharmacist --> UC_ViewRx
Pharmacist --> UC_FulfillRx
Pharmacist --> UC_SubmitClaim
Pharmacist --> UC_RegisterProvider
Pharmacist --> UC_ViewNotif

' Lab Technician relationships
LabTech --> UC_Login
LabTech --> UC_ViewLab
LabTech --> UC_ProcessLab
LabTech --> UC_EnterLabResults
LabTech --> UC_SubmitClaim
LabTech --> UC_RegisterProvider
LabTech --> UC_ViewNotif

' Radiologist relationships
Radiologist --> UC_Login
Radiologist --> UC_ViewRad
Radiologist --> UC_ProcessRad
Radiologist --> UC_EnterRadResults
Radiologist --> UC_SubmitClaim
Radiologist --> UC_RegisterProvider
Radiologist --> UC_ViewNotif

' Medical Admin relationships
MedAdmin --> UC_Login
MedAdmin --> UC_ReviewMedical
MedAdmin --> UC_ViewAllClaims
MedAdmin --> UC_ManageChronic
MedAdmin --> UC_ReviewEmerg
MedAdmin --> UC_ViewNotif
MedAdmin --> UC_SendNotif

' Coordination Admin relationships
CoordAdmin --> UC_Login
CoordAdmin --> UC_ReviewCoord
CoordAdmin --> UC_ApproveReject
CoordAdmin --> UC_ReturnClaim
CoordAdmin --> UC_ViewAllClaims
CoordAdmin --> UC_ViewReports
CoordAdmin --> UC_ViewNotif

' Insurance Manager relationships
Manager --> UC_Login
Manager --> UC_ManagePolicies
Manager --> UC_ManageUsers
Manager --> UC_ViewReports
Manager --> UC_ManagePrices
Manager --> UC_ManageProviders
Manager --> UC_ApproveFamily
Manager --> UC_ViewAllClaims
Manager --> UC_ViewNotif
Manager --> UC_SendNotif

' Emergency Manager relationships
EmergManager --> UC_Login
EmergManager --> UC_ReviewEmerg
EmergManager --> UC_ApproveEmerg
EmergManager --> UC_ViewNotif

@enduml
```

---

## 3. Class Diagram

```plantuml
@startuml Class_Diagram
skinparam class {
    BackgroundColor #FEFEFE
    BorderColor #0D3B66
    ArrowColor #0D3B66
}

package "Entity Layer" {

    class Client {
        -id: UUID
        -passwordHash: String
        -fullName: String
        -email: String
        -phone: String
        -employeeId: String
        -nationalId: String
        -department: String
        -faculty: String
        -dateOfBirth: LocalDate
        -gender: String
        -status: MemberStatus
        -emailVerified: boolean
        -createdAt: Instant
        -updatedAt: Instant
        +hasRole(roleName: RoleName): boolean
        +getAge(): Integer
    }

    class Role {
        -id: UUID
        -name: RoleName
        -description: String
    }

    class Policy {
        -id: UUID
        -policyNo: String
        -name: String
        -description: String
        -startDate: LocalDate
        -endDate: LocalDate
        -status: PolicyStatus
        -coverageLimit: BigDecimal
        -deductible: BigDecimal
        -emergencyRules: String
    }

    class Coverage {
        -id: UUID
        -coverageType: CoverageType
        -percentage: BigDecimal
        -maxAmount: BigDecimal
        -description: String
    }

    class HealthcareProviderClaim {
        -id: UUID
        -description: String
        -diagnosis: String
        -treatmentDetails: String
        -amount: Double
        -serviceDate: LocalDate
        -status: ClaimStatus
        -providerRole: String
        -invoiceImagePath: String
        -rejectionReason: String
        -isCovered: Boolean
        -insuranceCoveredAmount: BigDecimal
        -clientPayAmount: BigDecimal
        -isFollowUp: Boolean
        -submittedAt: Instant
        -approvedAt: Instant
        -medicalReviewedAt: Instant
    }

    class Prescription {
        -id: UUID
        -status: PrescriptionStatus
        -diagnosis: String
        -treatment: String
        -totalPrice: Double
        -isChronic: Boolean
        -createdAt: Instant
    }

    class PrescriptionItem {
        -id: UUID
        -medicationName: String
        -dosage: String
        -frequency: String
        -duration: String
        -quantity: Integer
        -unitPrice: BigDecimal
        -totalPrice: BigDecimal
    }

    class LabRequest {
        -id: UUID
        -testName: String
        -notes: String
        -resultUrl: String
        -status: LabRequestStatus
        -diagnosis: String
        -enteredPrice: Double
        -approvedPrice: Double
    }

    class RadiologyRequest {
        -id: UUID
        -scanType: String
        -notes: String
        -resultUrl: String
        -status: LabRequestStatus
        -diagnosis: String
        -enteredPrice: Double
        -approvedPrice: Double
    }

    class EmergencyRequest {
        -id: UUID
        -description: String
        -location: String
        -contactPhone: String
        -status: EmergencyStatus
        -rejectionReason: String
        -createdAt: Instant
    }

    class FamilyMember {
        -id: UUID
        -fullName: String
        -nationalId: String
        -insuranceNumber: String
        -relation: FamilyRelation
        -gender: Gender
        -dateOfBirth: LocalDate
        -status: ProfileStatus
    }

    class SearchProfile {
        -id: UUID
        -profileType: SearchProfileType
        -name: String
        -locationLat: BigDecimal
        -locationLng: BigDecimal
        -address: String
        -phone: String
        -status: ProfileStatus
    }

    class Notification {
        -id: UUID
        -title: String
        -message: String
        -type: NotificationType
        -isRead: boolean
        -createdAt: Instant
    }

    class PriceList {
        -id: UUID
        -serviceType: String
        -serviceName: String
        -unionPrice: BigDecimal
        -description: String
        -isActive: boolean
    }

    class Visit {
        -id: UUID
        -visitDate: LocalDate
        -diagnosis: String
        -treatment: String
        -notes: String
    }
}

package "Enums" {
    enum RoleName {
        INSURANCE_CLIENT
        DOCTOR
        PHARMACIST
        LAB_TECH
        RADIOLOGIST
        EMERGENCY_MANAGER
        INSURANCE_MANAGER
        MEDICAL_ADMIN
        COORDINATION_ADMIN
    }

    enum ClaimStatus {
        PENDING_MEDICAL
        AWAITING_COORDINATION_REVIEW
        APPROVED_FINAL
        REJECTED_FINAL
        RETURNED_FOR_REVIEW
    }

    enum PrescriptionStatus {
        PENDING
        APPROVED
        DISPENSED
        REJECTED
    }

    enum MemberStatus {
        ACTIVE
        INACTIVE
        SUSPENDED
    }

    enum ProfileStatus {
        PENDING
        APPROVED
        REJECTED
    }
}

' Relationships
Client "1" -- "*" Role : has >
Client "*" -- "1" Policy : belongs to >
Policy "1" -- "*" Coverage : defines >
Client "1" -- "*" HealthcareProviderClaim : submits >
Client "1" -- "*" Prescription : creates/receives >
Prescription "1" -- "*" PrescriptionItem : contains >
Client "1" -- "*" LabRequest : creates/processes >
Client "1" -- "*" RadiologyRequest : creates/processes >
Client "1" -- "*" EmergencyRequest : submits >
Client "1" -- "*" FamilyMember : has >
Client "1" -- "*" SearchProfile : owns >
Client "1" -- "*" Notification : receives >
Client "1" -- "*" Visit : participates >
PriceList "1" -- "*" PrescriptionItem : prices >
PriceList "1" -- "*" LabRequest : prices >
PriceList "1" -- "*" RadiologyRequest : prices >

@enduml
```

---

## 4. Sequence Diagram - Claims Workflow

```plantuml
@startuml Sequence_Claims_Workflow
skinparam sequence {
    ParticipantBackgroundColor #E8F5E9
    ParticipantBorderColor #0D3B66
    ArrowColor #0D3B66
    LifeLineBorderColor #0D3B66
}

title Healthcare Provider Claims Workflow

actor "Healthcare Provider\n(Doctor/Pharmacist/Lab/Radiology)" as Provider
actor "Insurance Client" as Client
participant "Frontend\n(React)" as Frontend
participant "API Gateway" as API
participant "Claims\nController" as Controller
participant "Claims\nService" as Service
database "PostgreSQL" as DB
actor "Medical Admin" as MedAdmin
actor "Coordination Admin" as CoordAdmin

== Claim Submission (by Provider) ==
Provider -> Frontend : Fill claim form
Frontend -> API : POST /api/healthcare-provider-claims/create
API -> Controller : createClaim(dto)
Controller -> Service : createClaim(dto)
Service -> DB : Save claim (status=PENDING_MEDICAL)
DB --> Service : Claim saved
Service -> Service : Send notification to Medical Admin
Service --> Controller : ClaimDTO
Controller --> API : 201 Created
API --> Frontend : Claim created
Frontend --> Provider : Success message

== Claim Submission (by Client) ==
Client -> Frontend : Fill claim form with invoice
Frontend -> API : POST /api/healthcare-provider-claims/client/create
API -> Controller : createClientClaim(dto)
Controller -> Service : createClientClaim(dto)
Service -> DB : Save claim (status=PENDING_MEDICAL)
DB --> Service : Claim saved
Service -> Service : Send notification to Medical Admin
Service --> Controller : ClaimDTO
Controller --> API : 201 Created
API --> Frontend : Claim created
Frontend --> Client : Success message

== Medical Review ==
MedAdmin -> Frontend : View pending claims
Frontend -> API : GET /api/healthcare-provider-claims/medical-review
API -> Controller : getMedicalReviewClaims()
Controller -> Service : getClaims(PENDING_MEDICAL)
Service -> DB : Query claims
DB --> Service : List<Claim>
Service --> Controller : List<ClaimDTO>
Controller --> API : 200 OK
API --> Frontend : Claims list
Frontend --> MedAdmin : Display claims

alt Medical Approval
    MedAdmin -> Frontend : Approve claim (medical)
    Frontend -> API : POST /api/healthcare-provider-claims/{id}/approve-medical
    API -> Controller : approveMedical(id)
    Controller -> Service : approveMedical(id)
    Service -> DB : Update status=APPROVED_BY_MEDICAL
    Service -> Service : Send notification to Coordination Admin
    Service --> Controller : Updated ClaimDTO
    Controller --> API : 200 OK
    API --> Frontend : Claim approved
    Frontend --> MedAdmin : Success message
else Medical Rejection
    MedAdmin -> Frontend : Reject claim (medical)
    Frontend -> API : POST /api/healthcare-provider-claims/{id}/reject-medical
    API -> Controller : rejectMedical(id, reason)
    Controller -> Service : rejectMedical(id, reason)
    Service -> DB : Update status=REJECTED_BY_MEDICAL
    Service -> Service : Send notification to Provider/Client
    Service --> Controller : Updated ClaimDTO
    Controller --> API : 200 OK
    API --> Frontend : Claim rejected
    Frontend --> MedAdmin : Success message
end

== Coordination Review ==
CoordAdmin -> Frontend : View approved claims
Frontend -> API : GET /api/healthcare-provider-claims/coordination-review
API -> Controller : getCoordinationReviewClaims()
Controller -> Service : getClaims(APPROVED_BY_MEDICAL)
Service -> DB : Query claims
DB --> Service : List<Claim>
Service --> Controller : List<ClaimDTO>
Controller --> API : 200 OK
API --> Frontend : Claims list
Frontend --> CoordAdmin : Display claims

alt Final Approval
    CoordAdmin -> Frontend : Approve claim (final)
    Frontend -> API : POST /api/healthcare-provider-claims/{id}/approve-final
    note right: Includes coverage calculation
    API -> Controller : finalApprove(id, dto)
    Controller -> Service : finalApprove(id, dto)
    Service -> Service : Calculate insurance/client amounts
    Service -> DB : Update status=APPROVED_FINAL
    Service -> Service : Send notification to Provider/Client
    Service --> Controller : Updated ClaimDTO
    Controller --> API : 200 OK
    API --> Frontend : Claim approved
    Frontend --> CoordAdmin : Success message
else Return for Review
    CoordAdmin -> Frontend : Return claim
    Frontend -> API : POST /api/healthcare-provider-claims/{id}/return-to-medical
    API -> Controller : returnToMedical(id, reason)
    Controller -> Service : returnToMedical(id, reason)
    Service -> DB : Update status=RETURNED_FOR_REVIEW
    Service -> Service : Send notification to Medical Admin
    Service --> Controller : Updated ClaimDTO
    Controller --> API : 200 OK
    API --> Frontend : Claim returned
    Frontend --> CoordAdmin : Success message
else Final Rejection
    CoordAdmin -> Frontend : Reject claim (final)
    Frontend -> API : POST /api/healthcare-provider-claims/{id}/reject-final
    API -> Controller : finalReject(id, reason)
    Controller -> Service : finalReject(id, reason)
    Service -> DB : Update status=REJECTED_FINAL
    Service -> Service : Send notification to Provider/Client
    Service --> Controller : Updated ClaimDTO
    Controller --> API : 200 OK
    API --> Frontend : Claim rejected
    Frontend --> CoordAdmin : Success message
end

== View Final Decisions ==
CoordAdmin -> Frontend : View all final decisions
Frontend -> API : GET /api/healthcare-provider-claims/final-decisions
API -> Controller : getFinalDecisions()
Controller -> Service : getClaims(APPROVED_FINAL, REJECTED_FINAL)
Service -> DB : Query claims
DB --> Service : List<Claim>
Service --> Controller : List<ClaimDTO>
Controller --> API : 200 OK
API --> Frontend : Final decisions list
Frontend --> CoordAdmin : Display claims history

@enduml
```

---

## 5. Sequence Diagram - Prescription Workflow

```plantuml
@startuml Sequence_Prescription_Workflow
skinparam sequence {
    ParticipantBackgroundColor #FFF8E1
    ParticipantBorderColor #0D3B66
    ArrowColor #0D3B66
}

title Prescription Creation and Fulfillment Workflow

actor "Doctor" as Doctor
actor "Patient/Client" as Patient
actor "Pharmacist" as Pharmacist
participant "Frontend\n(React)" as Frontend
participant "API Gateway" as API
participant "Prescription\nController" as Controller
participant "Prescription\nService" as Service
database "PostgreSQL" as DB

== Prescription Creation (Unified Request) ==
Doctor -> Frontend : Open unified request form
Doctor -> Frontend : Search patient by name/ID
Frontend -> API : GET /api/clients/search/name/{name}
API --> Frontend : List of matching clients
Frontend --> Doctor : Show patient list

Doctor -> Frontend : Select patient
Doctor -> Frontend : Add diagnosis & treatment
Doctor -> Frontend : Add medications from price list
Frontend -> API : GET /api/prescriptions/available-items
API --> Frontend : Available medications list
Doctor -> Frontend : Check active prescriptions
Frontend -> API : GET /api/prescriptions/check-active/{memberName}/{medicineId}
API --> Frontend : Active prescription status
Doctor -> Frontend : Submit prescription
Frontend -> API : POST /api/prescriptions/create
API -> Controller : createPrescription(dto)
Controller -> Service : createPrescription(dto)
Service -> Service : Validate patient insurance status
Service -> Service : Calculate total price from PriceList
Service -> DB : Save prescription (status=PENDING)
Service -> DB : Save prescription items
DB --> Service : Prescription saved
Service -> Service : Send notification to Patient
Service --> Controller : PrescriptionDTO
Controller --> API : 201 Created
API --> Frontend : Prescription created
Frontend --> Doctor : Success message

== Patient Views Prescription ==
Patient -> Frontend : View my prescriptions
Frontend -> API : GET /api/prescriptions/get
API -> Controller : getMyPrescriptions()
Controller -> Service : getPrescriptionsForMember(memberId)
Service -> DB : Query prescriptions
DB --> Service : List<Prescription>
Service --> Controller : List<PrescriptionDTO>
Controller --> API : 200 OK
API --> Frontend : Prescriptions list
Frontend --> Patient : Display prescriptions with status

== Pharmacist Fulfillment ==
Pharmacist -> Frontend : View pending prescriptions
Frontend -> API : GET /api/prescriptions/pending
API -> Controller : getPendingPrescriptions()
Controller -> Service : getPrescriptions(PENDING)
Service -> DB : Query prescriptions
DB --> Service : List<Prescription>
Service --> Controller : List<PrescriptionDTO>
Controller --> API : 200 OK
API --> Frontend : Pending prescriptions
Frontend --> Pharmacist : Display prescription cards

alt Verify Prescription
    Pharmacist -> Frontend : Verify prescription
    Frontend -> API : POST /api/prescriptions/{id}/verify
    API -> Controller : verifyPrescription(id)
    Controller -> Service : verifyPrescription(id, pharmacistId)
    Service -> DB : Update status=VERIFIED
    Service -> DB : Set pharmacist_id
    DB --> Service : Updated
    Service --> Controller : Updated PrescriptionDTO
    Controller --> API : 200 OK
    API --> Frontend : Prescription verified
    Frontend --> Pharmacist : Success message
else Reject Prescription
    Pharmacist -> Frontend : Reject prescription
    Frontend -> API : POST /api/prescriptions/{id}/reject
    note right: Include rejection reason
    API -> Controller : rejectPrescription(id, reason)
    Controller -> Service : rejectPrescription(id, reason)
    Service -> DB : Update status=REJECTED
    Service -> DB : Set rejection_reason
    DB --> Service : Updated
    Service -> Service : Send notification to Doctor/Patient
    Service --> Controller : Updated PrescriptionDTO
    Controller --> API : 200 OK
    API --> Frontend : Prescription rejected
    Frontend --> Pharmacist : Success message
end

== Pharmacist Bills Prescription ==
Pharmacist -> Frontend : Bill verified prescription
Frontend -> API : POST /api/prescriptions/{id}/bill
API -> Controller : billPrescription(id)
Controller -> Service : billPrescription(id, pharmacistId)
Service -> DB : Update status=BILLED
Service -> DB : Record billing timestamp
DB --> Service : Updated
Service -> Service : Send notification to Patient
Service --> Controller : Updated PrescriptionDTO
Controller --> API : 200 OK
API --> Frontend : Prescription billed
Frontend --> Pharmacist : Success - ready for claim

== Pharmacist Submits Claim ==
Pharmacist -> Frontend : Create claim for billed prescription
Frontend -> API : POST /api/healthcare-provider-claims/create
note right: Claim includes prescription details\nand total medication cost
API -> Controller : createClaim(dto)
Controller -> Service : createClaim(dto)
Service -> DB : Save claim (status=PENDING_MEDICAL)
DB --> Service : Claim saved
Service --> Controller : ClaimDTO
Controller --> API : 201 Created
API --> Frontend : Claim created
Frontend --> Pharmacist : Success message

@enduml
```

---

## 6. Activity Diagram - User Registration

```plantuml
@startuml Activity_User_Registration
skinparam activity {
    BackgroundColor #E8F5E9
    BorderColor #0D3B66
    ArrowColor #0D3B66
    DiamondBackgroundColor #FFF8E1
}

title User Registration Activity Diagram

start

:User navigates to Sign Up page;

:User selects account type;
note right
    - Insurance Client
    - Doctor
    - Pharmacist
    - Lab Technician
    - Radiologist
end note

:User fills registration form;
note right
    Required fields:
    - Full Name
    - Email
    - Password
    - National ID
    - Phone
    - Date of Birth

    Role-specific fields:
    - Employee ID (Doctors)
    - Specialization
    - Clinic Location
    - Pharmacy/Lab/Radiology Code
end note

if (All required fields filled?) then (no)
    :Display validation errors;
    :User corrects errors;
    backward:Return to form;
else (yes)
endif

:Submit registration form;

:System validates data;

if (Email already exists?) then (yes)
    :Display "Email already registered" error;
    stop
else (no)
endif

if (National ID already exists?) then (yes)
    :Display "National ID already registered" error;
    stop
else (no)
endif

:Create user account;
:Set status = ACTIVE;
:Set emailVerified = false;

if (Role = Insurance Client?) then (yes)
    :Account created immediately;
    :Generate email verification code;
    :Send verification email;
    :Redirect to email verification page;
else (no)
    :Set roleRequestStatus = PENDING;
    :Notify Insurance Manager;
    :Display "Registration pending approval" message;
endif

if (User verifies email?) then (yes)
    :Set emailVerified = true;
    :Account fully activated;
    :Redirect to login page;
else (no)
    :Account remains unverified;
    note right: User cannot login until\nemail is verified
endif

stop

@enduml
```

---

## 7. Activity Diagram - Claims Processing

```plantuml
@startuml Activity_Claims_Processing
skinparam activity {
    BackgroundColor #E3F2FD
    BorderColor #0D3B66
    ArrowColor #0D3B66
    DiamondBackgroundColor #FFF8E1
}

title Claims Processing Activity Diagram

start

partition "Provider Submission" {
    :Healthcare Provider logs in;
    :Navigate to "Submit Claim" page;
    :Fill claim details;
    note right
        - Patient information
        - Service date
        - Diagnosis
        - Treatment details
        - Amount
        - Invoice image
    end note
    :Upload supporting documents;
    :Submit claim;
    :System sets status = PENDING_MEDICAL;
    :Notification sent to Medical Admin;
}

partition "Medical Review" {
    :Medical Admin views pending claims;
    :Review claim details and documents;

    if (Claim medically appropriate?) then (yes)
        :Approve medical review;
        :Set status = AWAITING_COORDINATION_REVIEW;
        :Notification sent to Coordination Admin;
    else (no)
        :Reject with reason;
        :Set status = REJECTED_FINAL;
        :Notification sent to Provider;
        stop
    endif
}

partition "Coordination Review" {
    :Coordination Admin views approved claims;
    :Review claim for policy compliance;
    :Check coverage limits;
    :Calculate coverage amounts;

    if (Policy compliance check passed?) then (yes)
        if (Within coverage limits?) then (yes)
            :Final Approval;
            :Set status = APPROVED_FINAL;
            :Calculate insurance covered amount;
            :Calculate client pay amount;
            :Notification sent to Provider;
        else (no)
            :Approve with partial coverage;
            :Set status = APPROVED_FINAL;
            :Set coverage message;
            :Notification sent to Provider;
        endif
    else (no)
        if (Needs medical re-review?) then (yes)
            :Return for Review;
            :Set status = RETURNED_FOR_REVIEW;
            :Add review notes;
            :Notification sent to Medical Admin;
            ' Go back to Medical Review
        else (no)
            :Final Rejection;
            :Set status = REJECTED_FINAL;
            :Add rejection reason;
            :Notification sent to Provider;
            stop
        endif
    endif
}

partition "Claim Completed" {
    :Provider views claim status;
    :Provider downloads approval/rejection notice;
}

stop

@enduml
```

---

## 8. State Chart - Claim Status

```plantuml
@startuml State_Claim_Status
skinparam state {
    BackgroundColor #FAFAFA
    BorderColor #0D3B66
    ArrowColor #0D3B66
    StartColor #4CAF50
    EndColor #F44336
}

title Claim Status State Machine

[*] --> PENDING_MEDICAL : Claim Submitted

state PENDING_MEDICAL : Waiting for medical review
state APPROVED_BY_MEDICAL : Medical approved\nWaiting for coordination review
state REJECTED_BY_MEDICAL : Rejected during medical review
state RETURNED_FOR_REVIEW : Returned by coordination\nNeeds medical re-review
state APPROVED_FINAL : Claim fully approved
state REJECTED_FINAL : Claim rejected by coordination

PENDING_MEDICAL --> APPROVED_BY_MEDICAL : Medical Admin Approves
PENDING_MEDICAL --> REJECTED_BY_MEDICAL : Medical Admin Rejects

APPROVED_BY_MEDICAL --> APPROVED_FINAL : Coordination Admin Approves
APPROVED_BY_MEDICAL --> REJECTED_FINAL : Coordination Admin Rejects
APPROVED_BY_MEDICAL --> RETURNED_FOR_REVIEW : Coordination Admin Returns

RETURNED_FOR_REVIEW --> APPROVED_BY_MEDICAL : Medical Admin Re-approves
RETURNED_FOR_REVIEW --> REJECTED_BY_MEDICAL : Medical Admin Rejects

REJECTED_BY_MEDICAL --> [*]
APPROVED_FINAL --> [*]
REJECTED_FINAL --> [*]

note right of PENDING_MEDICAL
    Initial status when
    claim is submitted
    by provider or client
end note

note right of APPROVED_BY_MEDICAL
    Medical review passed
    Coordination review pending
end note

note left of REJECTED_BY_MEDICAL
    Medical admin determined
    claim is not medically valid
end note

note left of RETURNED_FOR_REVIEW
    Coordination admin found issues
    Needs medical admin attention
end note

note right of APPROVED_FINAL
    All reviews passed
    Provider can receive payment
end note

note left of REJECTED_FINAL
    Coordination admin rejected
    after medical approval
end note

@enduml
```

---

## 9. State Chart - Prescription Status

```plantuml
@startuml State_Prescription_Status
skinparam state {
    BackgroundColor #FFF8E1
    BorderColor #0D3B66
    ArrowColor #0D3B66
    StartColor #4CAF50
    EndColor #2196F3
}

title Prescription Status State Machine

[*] --> PENDING : Doctor Creates Prescription

state PENDING : Prescription created\nWaiting for pharmacy verification
state VERIFIED : Prescription validated by pharmacist\nReady for billing
state BILLED : Medications dispensed\nBilling completed
state REJECTED : Prescription rejected\nReason recorded

PENDING --> VERIFIED : Pharmacist Verifies
PENDING --> REJECTED : Pharmacist Rejects

VERIFIED --> BILLED : Pharmacist Bills/Dispenses
VERIFIED --> REJECTED : Pharmacist Rejects

BILLED --> [*]
REJECTED --> [*]

note right of PENDING
    Prescription available
    at all pharmacies in network
    Awaiting pharmacist action
end note

note right of VERIFIED
    Pharmacist confirmed
    prescription validity and
    medication availability
end note

note right of BILLED
    Medications dispensed
    Payment processed
    Pharmacist can submit claim
end note

note left of REJECTED
    Prescription invalidated
    Rejection reason required
    Patient/Doctor notified
end note

@enduml
```

---

## 10. Component Diagram

```plantuml
@startuml Component_Diagram
skinparam component {
    BackgroundColor #E8F5E9
    BorderColor #0D3B66
    ArrowColor #0D3B66
}

title System Component Architecture

package "Client Layer" {
    [Web Browser] as Browser
    [Mobile Browser] as Mobile
}

package "Frontend (React 19.1)" {
    [App Component] as App
    [React Router] as Router
    [Material-UI Components] as MUI
    [React Query] as RQuery
    [Axios HTTP Client] as Axios
    [Leaflet Maps] as Leaflet
    [i18n (Language Support)] as i18n

    package "Role Dashboards" {
        [Manager Dashboard] as ManagerDash
        [Client Dashboard] as ClientDash
        [Doctor Dashboard] as DoctorDash
        [Pharmacist Dashboard] as PharmDash
        [Lab Dashboard] as LabDash
        [Medical Admin Dashboard] as MedAdminDash
        [Coordination Dashboard] as CoordDash
    }

    package "Shared Components" {
        [Auth Components] as Auth
        [Claims Components] as Claims
        [Prescription Components] as Rx
        [Map Components] as Maps
        [Notification Components] as Notif
    }
}

package "Backend (Spring Boot)" {
    package "Controller Layer" {
        [AuthController] as AuthCtrl
        [ClientController] as ClientCtrl
        [ClaimController] as ClaimCtrl
        [PrescriptionController] as RxCtrl
        [LabRequestController] as LabCtrl
        [NotificationController] as NotifCtrl
        [ReportController] as ReportCtrl
    }

    package "Service Layer" {
        [AuthService] as AuthSvc
        [ClientService] as ClientSvc
        [ClaimService] as ClaimSvc
        [PrescriptionService] as RxSvc
        [NotificationService] as NotifSvc
    }

    package "Security" {
        [JWT Filter] as JWT
        [Security Config] as SecConfig
        [RBAC Handler] as RBAC
    }

    package "Data Layer" {
        [JPA Repositories] as Repos
        [MapStruct Mappers] as Mappers
    }
}

package "Data Layer" {
    database "PostgreSQL" as DB {
        [clients]
        [policies]
        [claims]
        [prescriptions]
        [notifications]
    }
}

package "External Services" {
    [Email Service (SMTP)] as Email
    cloud "AWS S3\n(File Storage)" as S3
}

' Connections
Browser --> App : HTTPS
Mobile --> App : HTTPS

App --> Router
App --> MUI
App --> RQuery
App --> i18n
Router --> ManagerDash
Router --> ClientDash
Router --> DoctorDash
Router --> PharmDash
Router --> LabDash
Router --> MedAdminDash
Router --> CoordDash

RQuery --> Axios
Axios --> AuthCtrl : REST API
Axios --> ClientCtrl : REST API
Axios --> ClaimCtrl : REST API
Axios --> RxCtrl : REST API
Axios --> LabCtrl : REST API
Axios --> NotifCtrl : REST API
Axios --> ReportCtrl : REST API

AuthCtrl --> JWT
ClientCtrl --> JWT
ClaimCtrl --> JWT
JWT --> SecConfig
SecConfig --> RBAC

AuthCtrl --> AuthSvc
ClientCtrl --> ClientSvc
ClaimCtrl --> ClaimSvc
RxCtrl --> RxSvc
NotifCtrl --> NotifSvc

AuthSvc --> Repos
ClientSvc --> Repos
ClaimSvc --> Repos
RxSvc --> Repos
NotifSvc --> Repos

Repos --> DB

NotifSvc --> Email
ClaimSvc --> S3

Maps --> Leaflet

@enduml
```

---

## 11. Deployment Diagram

```plantuml
@startuml Deployment_Diagram
skinparam node {
    BackgroundColor #E3F2FD
    BorderColor #0D3B66
}

title System Deployment Architecture

node "Client Devices" {
    node "Desktop Browser" as Desktop {
        artifact "React SPA" as ReactDesktop
    }
    node "Mobile Browser" as MobileDev {
        artifact "React SPA (Responsive)" as ReactMobile
    }
    node "Tablet" as Tablet {
        artifact "React SPA" as ReactTablet
    }
}

cloud "Internet" as Internet

node "CDN (Content Delivery)" as CDN {
    artifact "Static Assets" as Static
    artifact "JS Bundles" as Bundles
    artifact "CSS Files" as CSS
}

node "Application Server" as AppServer {
    node "Frontend Container" as FrontendContainer {
        artifact "Vite Build" as ViteBuild
        artifact "React 19.1" as ReactApp
        artifact "Material-UI 7.3" as MUILib
    }

    node "Backend Container" as BackendContainer {
        artifact "Spring Boot JAR" as SpringBoot
        artifact "JVM Runtime" as JVM
        component "REST API" as API
        component "JWT Security" as JWTSec
    }
}

node "Database Server" as DBServer {
    database "PostgreSQL 15" as Postgres {
        storage "clients" as ClientsTable
        storage "policies" as PoliciesTable
        storage "claims" as ClaimsTable
        storage "prescriptions" as RxTable
        storage "notifications" as NotifTable
    }
}

node "File Storage" as FileStorage {
    storage "Invoice Images" as Invoices
    storage "Profile Images" as Profiles
    storage "Documents" as Docs
}

node "Email Server" as EmailServer {
    component "SMTP Service" as SMTP
}

' Connections
Desktop --> Internet
MobileDev --> Internet
Tablet --> Internet

Internet --> CDN
CDN --> FrontendContainer

FrontendContainer --> BackendContainer : HTTP/REST
BackendContainer --> Postgres : JDBC
BackendContainer --> FileStorage : File I/O
BackendContainer --> EmailServer : SMTP

note right of CDN
    Static assets served via
    CDN for performance
end note

note right of BackendContainer
    Spring Boot with
    embedded Tomcat server
end note

note right of Postgres
    PostgreSQL with
    indexed tables for
    fast queries
end note

@enduml
```

---

## 12. Data Flow Diagram (Context Level - DFD Level 0)

```plantuml
@startuml DFD_Context_Level
skinparam rectangle {
    BackgroundColor #E8F5E9
    BorderColor #0D3B66
}

title Data Flow Diagram - Context Level (DFD Level 0)

' External Entities
actor "Insurance Client" as Client
actor "Healthcare Provider\n(Doctor/Pharmacist/Lab/Radiology)" as Provider
actor "Medical Administrator" as MedAdmin
actor "Coordination Administrator" as CoordAdmin
actor "Insurance Manager" as Manager

' System
rectangle "Birzeit University\nInsurance System" as System #LightBlue

' Data Stores
database "PostgreSQL\nDatabase" as DB

' External Systems
cloud "Email Service" as Email
cloud "File Storage" as Storage

' Data Flows from Client
Client --> System : Registration Data
Client --> System : Claim Submissions
Client --> System : Family Member Data
Client --> System : Emergency Requests
System --> Client : Policy Information
System --> Client : Claim Status Updates
System --> Client : Prescriptions
System --> Client : Notifications

' Data Flows from Provider
Provider --> System : Service Claims
Provider --> System : Prescriptions
Provider --> System : Lab/Radiology Requests
Provider --> System : Profile Registration
System --> Provider : Patient Information
System --> Provider : Claim Status
System --> Provider : Notifications

' Data Flows from Medical Admin
MedAdmin --> System : Medical Decisions
MedAdmin --> System : Chronic Patient Management
System --> MedAdmin : Pending Claims
System --> MedAdmin : Medical Reports

' Data Flows from Coordination Admin
CoordAdmin --> System : Final Decisions
CoordAdmin --> System : Return Requests
System --> CoordAdmin : Reviewed Claims
System --> CoordAdmin : Coordination Reports

' Data Flows from Manager
Manager --> System : Policy Management
Manager --> System : User Approvals
Manager --> System : Price List Updates
System --> Manager : System Reports
System --> Manager : Dashboard Statistics

' System to Data Stores
System <--> DB : All System Data
System --> Email : Notification Emails
System <--> Storage : File Upload/Download

@enduml
```

---

## 13. System Architecture Overview

```plantuml
@startuml System_Architecture_Overview
skinparam rectangle {
    BackgroundColor #FAFAFA
    BorderColor #0D3B66
}

title Birzeit University Insurance System - Architecture Overview

package "Presentation Layer" #E3F2FD {
    rectangle "React 19.1 SPA" as ReactSPA {
        component "Material-UI 7.3" as MUI
        component "React Router 7.8" as Router
        component "React Query 5.90" as RQuery
        component "Leaflet Maps" as Maps
        component "i18n (EN/AR)" as i18n
    }
}

package "Application Layer" #E8F5E9 {
    rectangle "Spring Boot Backend" as SpringBoot {
        component "REST Controllers" as Controllers
        component "Business Services" as Services
        component "JWT Security" as Security
        component "MapStruct Mappers" as Mappers
    }
}

package "Data Layer" #FFF8E1 {
    rectangle "Data Access" as DataAccess {
        component "JPA Repositories" as Repos
        component "Entity Models" as Entities
        database "PostgreSQL" as DB
    }
}

package "External Integrations" #FCE4EC {
    component "Email Service" as Email
    component "File Storage" as Storage
}

' Connections
ReactSPA --> SpringBoot : REST API (HTTPS)
SpringBoot --> DataAccess : JPA/Hibernate
Services --> Email : Notifications
Services --> Storage : Documents

note right of ReactSPA
    **Frontend Technologies:**
    - React 19.1 with Hooks
    - Material-UI 7.3
    - Vite 7.1 build tool
    - Lazy loading & code splitting
    - PWA capabilities
end note

note right of SpringBoot
    **Backend Technologies:**
    - Spring Boot 3.x
    - Spring Security + JWT
    - Spring Data JPA
    - MapStruct for DTOs
    - Lombok for boilerplate
end note

note right of DataAccess
    **Database:**
    - PostgreSQL 15
    - 20+ tables
    - Indexed queries
    - UUID primary keys
end note

@enduml
```

---

## 14. Sequence Diagram - Lab Request Workflow

```plantuml
@startuml Lab_Request_Workflow
!theme plain
skinparam backgroundColor #FEFEFE
skinparam sequenceArrowThickness 2
skinparam roundcorner 10
skinparam maxMessageSize 200

title Lab Request Workflow Sequence Diagram

actor "Doctor" as Doctor #90CAF9
actor "Client/Patient" as Client #A5D6A7
actor "Lab Technician" as LabTech #FFB74D
participant "Frontend\n(React)" as Frontend #E1BEE7
participant "API Gateway\n(Spring Boot)" as API #B2DFDB
database "PostgreSQL" as DB #FFCCBC

== Lab Request Creation ==

Doctor -> Frontend : Create lab request
activate Frontend
Frontend -> API : POST /api/lab-requests
activate API
API -> API : Validate doctor permissions
API -> API : Validate patient insurance status
API -> DB : Save lab request (status: PENDING)
activate DB
DB --> API : Request saved with UUID
deactivate DB
API -> API : Send notification to client
API --> Frontend : 201 Created (request details)
deactivate API
Frontend --> Doctor : Request created successfully
deactivate Frontend

Client -> Frontend : View pending lab requests
activate Frontend
Frontend -> API : GET /api/lab-requests/my-requests
activate API
API -> DB : Fetch client's lab requests
activate DB
DB --> API : Lab request list
deactivate DB
API --> Frontend : Lab requests with statuses
deactivate API
Frontend --> Client : Display lab requests
deactivate Frontend

== Lab Processing ==

LabTech -> Frontend : View assigned lab requests
activate Frontend
Frontend -> API : GET /api/lab-requests/pending
activate API
API -> API : Filter by lab technician's facility
API -> DB : Fetch pending requests
activate DB
DB --> API : Pending lab requests
deactivate DB
API --> Frontend : Pending requests list
deactivate API
Frontend --> LabTech : Display pending requests
deactivate Frontend

LabTech -> Frontend : Start processing request
activate Frontend
Frontend -> API : PUT /api/lab-requests/{id}/status
note right: status: IN_PROGRESS
activate API
API -> DB : Update status to IN_PROGRESS
activate DB
DB --> API : Status updated
deactivate DB
API -> API : Notify client of status change
API --> Frontend : 200 OK
deactivate API
Frontend --> LabTech : Status updated
deactivate Frontend

== Results Entry ==

LabTech -> Frontend : Enter test results
activate Frontend
Frontend -> API : PUT /api/lab-requests/{id}/results
note right
  {
    "results": "Test values...",
    "resultUrl": "/files/lab/...",
    "enteredPrice": 150.00
  }
end note
activate API
API -> API : Validate result data
API -> DB : Save results and update status
activate DB
note right of DB: status: COMPLETED
DB --> API : Results saved
deactivate DB
API -> API : Notify doctor and client
API --> Frontend : 200 OK (completed request)
deactivate API
Frontend --> LabTech : Results submitted
deactivate Frontend

== Result Viewing ==

Client -> Frontend : View completed results
activate Frontend
Frontend -> API : GET /api/lab-requests/{id}
activate API
API -> DB : Fetch request with results
activate DB
DB --> API : Complete request data
deactivate DB
API --> Frontend : Request with results
deactivate API
Frontend --> Client : Display test results
deactivate Frontend

note over Doctor, DB
  **Lab Request Statuses:**
  • PENDING - Awaiting lab processing
  • IN_PROGRESS - Lab is running tests
  • COMPLETED - Results available
  • CANCELLED - Request cancelled
end note

@enduml
```

---

## 15. Sequence Diagram - Radiology Request Workflow

```plantuml
@startuml Radiology_Request_Workflow
!theme plain
skinparam backgroundColor #FEFEFE
skinparam sequenceArrowThickness 2
skinparam roundcorner 10
skinparam maxMessageSize 200

title Radiology Request Workflow Sequence Diagram

actor "Doctor" as Doctor #90CAF9
actor "Client/Patient" as Client #A5D6A7
actor "Radiologist" as Radiologist #FF8A65
participant "Frontend\n(React)" as Frontend #E1BEE7
participant "API Gateway\n(Spring Boot)" as API #B2DFDB
database "PostgreSQL" as DB #FFCCBC
participant "File Storage" as Storage #FFF59D

== Radiology Request Creation ==

Doctor -> Frontend : Create radiology request
activate Frontend
note right
  Scan Type: MRI, CT, X-Ray, Ultrasound
  Body Part: Specified region
  Clinical Notes: Reason for imaging
end note
Frontend -> API : POST /api/radiology-requests
activate API
API -> API : Validate doctor authorization
API -> API : Check patient policy coverage
API -> DB : Save radiology request (status: PENDING)
activate DB
DB --> API : Request created with UUID
deactivate DB
API -> API : Notify client & assigned facility
API --> Frontend : 201 Created
deactivate API
Frontend --> Doctor : Radiology order submitted
deactivate Frontend

== Client Notification ==

Client -> Frontend : View pending radiology orders
activate Frontend
Frontend -> API : GET /api/radiology-requests/my-requests
activate API
API -> DB : Fetch client's radiology requests
activate DB
DB --> API : Radiology requests list
deactivate DB
API --> Frontend : Requests with scheduling info
deactivate API
Frontend --> Client : Display pending imaging orders
deactivate Frontend

== Imaging Processing ==

Radiologist -> Frontend : View assigned requests
activate Frontend
Frontend -> API : GET /api/radiology-requests/pending
activate API
API -> API : Filter by radiologist's facility
API -> DB : Fetch pending radiology requests
activate DB
DB --> API : Pending requests
deactivate DB
API --> Frontend : Assigned requests list
deactivate API
Frontend --> Radiologist : Display pending imaging orders
deactivate Frontend

Radiologist -> Frontend : Begin imaging procedure
activate Frontend
Frontend -> API : PUT /api/radiology-requests/{id}/status
note right: status: IN_PROGRESS
activate API
API -> DB : Update status
activate DB
DB --> API : Status updated
deactivate DB
API -> API : Notify client
API --> Frontend : 200 OK
deactivate API
Frontend --> Radiologist : Status changed to In Progress
deactivate Frontend

== Results Upload ==

Radiologist -> Frontend : Upload imaging results
activate Frontend
Frontend -> API : POST /api/radiology-requests/{id}/upload
note right
  multipart/form-data:
  - DICOM images
  - Radiologist report PDF
end note
activate API
API -> Storage : Store imaging files
activate Storage
Storage --> API : File URLs returned
deactivate Storage
API -> DB : Update request with result URLs
activate DB
note right of DB
  resultUrl: /files/radiology/...
  status: COMPLETED
  enteredPrice: 350.00
end note
DB --> API : Request updated
deactivate DB
API -> API : Notify doctor and client
API --> Frontend : 200 OK (imaging complete)
deactivate API
Frontend --> Radiologist : Results uploaded successfully
deactivate Frontend

== Viewing Results ==

Doctor -> Frontend : View imaging results
activate Frontend
Frontend -> API : GET /api/radiology-requests/{id}
activate API
API -> DB : Fetch complete request
activate DB
DB --> API : Request with imaging URLs
deactivate DB
API --> Frontend : Complete radiology data
deactivate API
Frontend -> Storage : Load imaging files
activate Storage
Storage --> Frontend : DICOM/Report files
deactivate Storage
Frontend --> Doctor : Display imaging and report
deactivate Frontend

Client -> Frontend : Download imaging report
activate Frontend
Frontend -> API : GET /api/radiology-requests/{id}/download
activate API
API -> Storage : Retrieve report file
activate Storage
Storage --> API : Report PDF
deactivate Storage
API --> Frontend : File stream
deactivate API
Frontend --> Client : Download radiology report
deactivate Frontend

note over Doctor, Storage
  **Supported Imaging Types:**
  • X-Ray - Standard radiography
  • CT Scan - Computed tomography
  • MRI - Magnetic resonance imaging
  • Ultrasound - Sonography
  • Mammography - Breast imaging
end note

@enduml
```

---

## 16. Sequence Diagram - Emergency Request Workflow

```plantuml
@startuml Emergency_Request_Workflow
!theme plain
skinparam backgroundColor #FEFEFE
skinparam sequenceArrowThickness 2
skinparam roundcorner 10
skinparam maxMessageSize 200

title Emergency Request Workflow Sequence Diagram

actor "Client" as Client #A5D6A7
actor "Emergency Manager" as EmergencyMgr #F44336
actor "Medical Admin" as MedAdmin #7986CB
actor "Insurance Manager" as InsMgr #9575CD
participant "Frontend\n(React)" as Frontend #E1BEE7
participant "API Gateway\n(Spring Boot)" as API #B2DFDB
participant "Notification\nService" as Notif #FFAB91
database "PostgreSQL" as DB #FFCCBC

== Emergency Request Submission ==

Client -> Frontend : Submit emergency request
activate Frontend
note right
  **Emergency Details:**
  - Description of emergency
  - Location (GPS/address)
  - Contact phone number
  - Priority level
end note
Frontend -> API : POST /api/emergency-requests
activate API
API -> API : Validate client insurance status
API -> API : Flag as URGENT priority
API -> DB : Save emergency request
activate DB
note right of DB: status: SUBMITTED
DB --> API : Request saved with UUID
deactivate DB

API -> Notif : Trigger emergency alerts
activate Notif
Notif -> Notif : Send SMS to Emergency Manager
Notif -> Notif : Send push notification
Notif -> Notif : Send email alert
Notif --> API : Alerts sent
deactivate Notif

API --> Frontend : 201 Created (emergency ID)
deactivate API
Frontend --> Client : Emergency request submitted\n(ID: EMR-xxxx)
deactivate Frontend

== Emergency Triage ==

EmergencyMgr -> Frontend : View urgent requests
activate Frontend
Frontend -> API : GET /api/emergency-requests?status=SUBMITTED
activate API
API -> DB : Fetch pending emergencies
activate DB
DB --> API : Emergency requests list
deactivate DB
API --> Frontend : Urgent requests (sorted by priority)
deactivate API
Frontend --> EmergencyMgr : Display emergency queue
deactivate Frontend

EmergencyMgr -> Frontend : Review and accept emergency
activate Frontend
Frontend -> API : PUT /api/emergency-requests/{id}/accept
activate API
API -> DB : Update status to IN_REVIEW
activate DB
DB --> API : Status updated
deactivate DB
API -> Notif : Notify client of acceptance
activate Notif
Notif --> API : Client notified
deactivate Notif
API --> Frontend : 200 OK
deactivate API
Frontend --> EmergencyMgr : Emergency accepted for review
deactivate Frontend

== Medical Review (Expedited) ==

MedAdmin -> Frontend : Review emergency case
activate Frontend
Frontend -> API : GET /api/emergency-requests/{id}
activate API
API -> DB : Fetch emergency details
activate DB
DB --> API : Emergency data with client info
deactivate DB
API --> Frontend : Complete emergency information
deactivate API
Frontend --> MedAdmin : Display emergency for review
deactivate Frontend

MedAdmin -> Frontend : Approve medical necessity
activate Frontend
Frontend -> API : PUT /api/emergency-requests/{id}/medical-review
note right
  {
    "approved": true,
    "notes": "Emergency is medically justified",
    "coveredAmount": 5000.00
  }
end note
activate API
API -> DB : Save medical review decision
activate DB
note right of DB: status: MEDICAL_APPROVED
DB --> API : Review saved
deactivate DB
API -> Notif : Notify stakeholders
activate Notif
Notif --> API : Notifications sent
deactivate Notif
API --> Frontend : 200 OK
deactivate API
Frontend --> MedAdmin : Medical review completed
deactivate Frontend

== Final Approval ==

InsMgr -> Frontend : Final emergency approval
activate Frontend
Frontend -> API : PUT /api/emergency-requests/{id}/approve
activate API
API -> API : Verify policy coverage limits
API -> API : Calculate coverage amount
API -> DB : Update to APPROVED status
activate DB
note right of DB
  status: APPROVED
  insuranceCoveredAmount: 4500.00
  clientPayAmount: 500.00
end note
DB --> API : Emergency approved
deactivate DB
API -> Notif : Send approval notification
activate Notif
Notif -> Client : SMS + Email with approval details
Notif --> API : Client notified
deactivate Notif
API --> Frontend : 200 OK (approval details)
deactivate API
Frontend --> InsMgr : Emergency approved
deactivate Frontend

== Client Receives Confirmation ==

Client -> Frontend : View emergency status
activate Frontend
Frontend -> API : GET /api/emergency-requests/{id}
activate API
API -> DB : Fetch emergency with decisions
activate DB
DB --> API : Complete emergency record
deactivate DB
API --> Frontend : Approved emergency details
deactivate API
Frontend --> Client : Display approval\n(Covered: $4,500)
deactivate Frontend

== Alternative: Emergency Rejection ==

note over Client, DB #FFCDD2
  **If Emergency is Rejected:**
  1. MedAdmin/InsMgr provides rejection reason
  2. Status changes to REJECTED
  3. Client notified with appeal instructions
  4. Client can submit additional documentation
  5. Re-review process available
end note

@enduml
```

---

## 17. State Chart - Lab Request Status

```plantuml
@startuml Lab_Request_State_Chart
!theme plain
skinparam backgroundColor #FEFEFE
skinparam state {
    BackgroundColor #E3F2FD
    BorderColor #1565C0
    ArrowColor #1565C0
}

title Lab Request Status State Chart

[*] --> Pending : Doctor creates request

state Pending #FFF9C4 {
    Pending : Request submitted
    Pending : Awaiting lab processing
    Pending : Notification sent to lab
}

state InProgress #BBDEFB {
    InProgress : Lab technician started
    InProgress : Tests being performed
    InProgress : Samples being analyzed
}

state Completed #C8E6C9 {
    Completed : Results entered
    Completed : Available to client/doctor
    Completed : Can be used for claims
}

state Cancelled #FFCDD2 {
    Cancelled : Request terminated
    Cancelled : No results generated
}

Pending --> InProgress : Lab tech accepts
Pending --> Cancelled : Doctor cancels\n/ Client cancels

InProgress --> Completed : Results submitted
InProgress --> Cancelled : Lab cancels\n(equipment failure)

Completed --> [*]
Cancelled --> [*]

note right of Pending
  **Actors:**
  • Doctor - creates
  • Client - views
  • Lab Tech - receives
end note

note right of InProgress
  **Lab Actions:**
  • Start processing
  • Run tests
  • Enter interim results
end note

note right of Completed
  **Result Contents:**
  • Test values
  • Reference ranges
  • Technician notes
  • Result file URL
end note

@enduml
```

---

## 18. State Chart - Radiology Request Status

```plantuml
@startuml Radiology_Request_State_Chart
!theme plain
skinparam backgroundColor #FEFEFE
skinparam state {
    BackgroundColor #FFF3E0
    BorderColor #E65100
    ArrowColor #E65100
}

title Radiology Request Status State Chart

[*] --> Pending : Doctor orders imaging

state Pending #FFF9C4 {
    Pending : Imaging order submitted
    Pending : Awaiting scheduling
    Pending : Facility notified
}

state Scheduled #E1BEE7 {
    Scheduled : Appointment set
    Scheduled : Client notified
    Scheduled : Prep instructions sent
}

state InProgress #BBDEFB {
    InProgress : Imaging in progress
    InProgress : Patient being scanned
    InProgress : Radiologist analyzing
}

state Completed #C8E6C9 {
    Completed : Images captured
    Completed : Report generated
    Completed : Results available
}

state Cancelled #FFCDD2 {
    Cancelled : Order cancelled
    Cancelled : No imaging performed
}

Pending --> Scheduled : Appointment booked
Pending --> Cancelled : Doctor cancels

Scheduled --> InProgress : Patient arrives
Scheduled --> Cancelled : No-show / Cancellation

InProgress --> Completed : Report finalized
InProgress --> Pending : Reschedule needed\n(technical issues)

Completed --> [*]
Cancelled --> [*]

note right of Pending
  **Imaging Types:**
  • X-Ray
  • CT Scan
  • MRI
  • Ultrasound
  • Mammography
end note

note right of Completed
  **Deliverables:**
  • DICOM images
  • Radiologist report
  • Findings summary
  • Recommendations
end note

@enduml
```

---

## 19. State Chart - Emergency Request Status

```plantuml
@startuml Emergency_Request_State_Chart
!theme plain
skinparam backgroundColor #FEFEFE
skinparam state {
    BackgroundColor #FFEBEE
    BorderColor #C62828
    ArrowColor #C62828
}

title Emergency Request Status State Chart

[*] --> Submitted : Client submits emergency

state Submitted #FFF9C4 {
    Submitted : Emergency reported
    Submitted : Urgent flag set
    Submitted : Managers alerted
}

state InReview #FFE0B2 {
    InReview : Emergency Manager accepted
    InReview : Case being triaged
    InReview : Priority assessed
}

state MedicalReview #E1BEE7 {
    MedicalReview : Medical Admin reviewing
    MedicalReview : Necessity evaluation
    MedicalReview : Coverage determination
}

state Approved #C8E6C9 {
    Approved : Fully approved
    Approved : Coverage confirmed
    Approved : Client notified
}

state Rejected #FFCDD2 {
    Rejected : Emergency denied
    Rejected : Reason provided
    Rejected : Appeal available
}

state Resolved #B2DFDB {
    Resolved : Emergency handled
    Resolved : Services rendered
    Resolved : Claim processed
}

Submitted --> InReview : Manager accepts
Submitted --> Rejected : Invalid request

InReview --> MedicalReview : Triage complete
InReview --> Rejected : Not an emergency

MedicalReview --> Approved : Medically justified
MedicalReview --> Rejected : Not medically necessary

Approved --> Resolved : Services completed
Rejected --> Submitted : Appeal with new info

Resolved --> [*]
Rejected --> [*]

note right of Submitted
  **Priority Levels:**
  • CRITICAL - Life threatening
  • URGENT - Requires immediate care
  • HIGH - Same-day attention
  • STANDARD - Non-urgent
end note

note right of Approved
  **Expedited Processing:**
  • Bypasses normal queue
  • Real-time notifications
  • Immediate coverage confirmation
end note

@enduml
```

---

## 20. Role Permission Matrix Diagram

```plantuml
@startuml Role_Permission_Matrix
!theme plain
skinparam backgroundColor #FEFEFE

title Role-Based Access Control (RBAC) Permission Matrix

skinparam class {
    BackgroundColor #E3F2FD
    BorderColor #1565C0
}

package "System Roles" #F5F5F5 {

    class "INSURANCE_MANAGER" as IM #C8E6C9 {
        <b>Claims Management</b>
        --
        ✓ View all claims
        ✓ Approve/Reject claims (Final)
        ✓ Override decisions
        ✓ View claim analytics
        ==
        <b>Policy Management</b>
        --
        ✓ Create policies
        ✓ Edit policies
        ✓ Delete policies
        ✓ Manage coverage rules
        ==
        <b>User Management</b>
        --
        ✓ Approve role requests
        ✓ Assign/Revoke roles
        ✓ View all users
        ✓ Deactivate accounts
        ==
        <b>Reports & Analytics</b>
        --
        ✓ Generate all reports
        ✓ Export data
        ✓ View audit logs
    }

    class "MEDICAL_ADMINISTRATOR" as MA #BBDEFB {
        <b>Medical Review</b>
        --
        ✓ Review claims (Medical)
        ✓ Approve/Reject (Medical)
        ✓ View patient records
        ✓ Access medical history
        ==
        <b>Emergency Management</b>
        --
        ✓ Triage emergencies
        ✓ Prioritize requests
        ✓ Medical clearance
        ==
        <b>Healthcare Oversight</b>
        --
        ✓ Manage chronic records
        ✓ Review prescriptions
        ✓ Quality assurance
    }

    class "COORDINATION_ADMINISTRATOR" as CA #E1BEE7 {
        <b>Coordination Review</b>
        --
        ✓ Review claims (Coordination)
        ✓ Verify policy compliance
        ✓ Check eligibility
        ✓ Approve/Reject (Coord)
        ==
        <b>Provider Relations</b>
        --
        ✓ Manage provider network
        ✓ Verify provider status
        ✓ Coordinate services
        ==
        <b>Documentation</b>
        --
        ✓ Request documents
        ✓ Verify submissions
        ✓ Generate reports
    }

    class "CLIENT" as CL #FFF9C4 {
        <b>Personal Claims</b>
        --
        ✓ Submit own claims
        ✓ View own claims
        ✓ Track claim status
        ✓ Upload documents
        ==
        <b>Requests</b>
        --
        ✓ View prescriptions
        ✓ View lab requests
        ✓ View radiology requests
        ✓ Submit emergencies
        ==
        <b>Account</b>
        --
        ✓ Manage profile
        ✓ Manage family members
        ✓ View policy details
        ✓ Search providers
    }

    class "DOCTOR" as DOC #B2DFDB {
        <b>Patient Care</b>
        --
        ✓ Create prescriptions
        ✓ Order lab tests
        ✓ Order radiology
        ✓ View patient insurance
        ==
        <b>Claims</b>
        --
        ✓ Submit service claims
        ✓ View own claims
        ✓ Attach documentation
        ==
        <b>Records</b>
        --
        ✓ Access patient history
        ✓ Add clinical notes
        ✓ Emergency requests
    }

    class "PHARMACIST" as PHARM #FFCCBC {
        <b>Prescriptions</b>
        --
        ✓ View pending Rx
        ✓ Fulfill prescriptions
        ✓ Update Rx status
        ✓ Dispense medications
        ==
        <b>Claims</b>
        --
        ✓ Submit pharmacy claims
        ✓ View own claims
        ✓ Track payments
        ==
        <b>Coverage</b>
        --
        ✓ Check patient coverage
        ✓ View formulary
        ✓ Search providers
    }

    class "LAB_TECHNICIAN" as LAB #DCEDC8 {
        <b>Lab Requests</b>
        --
        ✓ View assigned requests
        ✓ Start processing
        ✓ Enter results
        ✓ Upload reports
        ==
        <b>Claims</b>
        --
        ✓ Submit lab claims
        ✓ View own claims
        ✓ Enter pricing
        ==
        <b>Patient Access</b>
        --
        ✓ View patient info
        ✓ Contact information
    }

    class "RADIOLOGIST" as RAD #D1C4E9 {
        <b>Radiology Requests</b>
        --
        ✓ View assigned imaging
        ✓ Perform imaging
        ✓ Upload DICOM files
        ✓ Write reports
        ==
        <b>Claims</b>
        --
        ✓ Submit radiology claims
        ✓ View own claims
        ✓ Enter pricing
        ==
        <b>Scheduling</b>
        --
        ✓ Manage appointments
        ✓ View calendar
    }

    class "EMERGENCY_MANAGER" as EM #FFCDD2 {
        <b>Emergency Response</b>
        --
        ✓ Accept emergencies
        ✓ Triage requests
        ✓ Prioritize queue
        ✓ Coordinate response
        ==
        <b>Workflow Override</b>
        --
        ✓ Expedite approvals
        ✓ Real-time alerts
        ✓ Status updates
        ==
        <b>Reporting</b>
        --
        ✓ Emergency statistics
        ✓ Response times
        ✓ Incident reports
    }
}

note bottom of IM
  **Permission Count: 30+**
  Highest authority level
  Full system access
end note

note bottom of CL
  **Permission Count: 20+**
  Self-service focused
  Read-only for most data
end note

@enduml
```

---

## 21. Frontend Component Architecture Diagram

```plantuml
@startuml Frontend_Architecture
!theme plain
skinparam backgroundColor #FEFEFE
skinparam componentStyle uml2

title React Frontend Component Architecture

skinparam component {
    BackgroundColor #E3F2FD
    BorderColor #1565C0
}

package "Application Shell" #F5F5F5 {
    component [App.jsx] as App #BBDEFB
    component [Router\n(React Router v6)] as Router #BBDEFB
    component [ThemeProvider\n(Material-UI)] as Theme #E1BEE7
    component [I18nProvider\n(react-i18next)] as I18n #FFF9C4
    component [QueryProvider\n(React Query)] as Query #C8E6C9
}

package "Layout Components" #E8F5E9 {
    component [MainLayout] as MainLayout #B2DFDB
    component [Sidebar] as Sidebar #B2DFDB
    component [Header] as Header #B2DFDB
    component [Footer] as Footer #B2DFDB
}

package "Authentication" #FFEBEE {
    component [LoginPage] as Login #FFCDD2
    component [RegisterPage] as Register #FFCDD2
    component [ProtectedRoute] as Protected #FFCDD2
    component [AuthContext] as AuthCtx #FFCDD2
}

package "Dashboard Pages" #E3F2FD {
    component [InsuranceManagerDashboard] as IMDash #90CAF9
    component [MedicalAdminDashboard] as MADash #90CAF9
    component [CoordinationDashboard] as CADash #90CAF9
    component [ClientDashboard] as CLDash #90CAF9
    component [DoctorDashboard] as DOCDash #90CAF9
    component [PharmacistDashboard] as PHDash #90CAF9
    component [LabTechDashboard] as LABDash #90CAF9
    component [RadiologistDashboard] as RADDash #90CAF9
    component [EmergencyDashboard] as EMDash #90CAF9
}

package "Claims Module" #FFF3E0 {
    component [ClaimsList] as ClaimsList #FFE0B2
    component [ClaimDetails] as ClaimDetails #FFE0B2
    component [SubmitClaim] as SubmitClaim #FFE0B2
    component [ClaimReview] as ClaimReview #FFE0B2
}

package "Prescription Module" #F3E5F5 {
    component [PrescriptionsList] as RxList #E1BEE7
    component [CreatePrescription] as CreateRx #E1BEE7
    component [PrescriptionDetails] as RxDetails #E1BEE7
    component [FulfillPrescription] as FulfillRx #E1BEE7
}

package "Lab/Radiology Module" #E8EAF6 {
    component [LabRequestsList] as LabList #C5CAE9
    component [CreateLabRequest] as CreateLab #C5CAE9
    component [RadiologyRequestsList] as RadList #C5CAE9
    component [CreateRadiologyRequest] as CreateRad #C5CAE9
    component [ResultsViewer] as Results #C5CAE9
}

package "Emergency Module" #FFEBEE {
    component [EmergencyList] as EmergList #FFCDD2
    component [SubmitEmergency] as SubmitEmerg #FFCDD2
    component [EmergencyTriage] as Triage #FFCDD2
}

package "Shared Components" #ECEFF1 {
    component [DataTable] as DataTable #CFD8DC
    component [FormComponents] as Forms #CFD8DC
    component [SearchBar] as Search #CFD8DC
    component [FileUpload] as Upload #CFD8DC
    component [NotificationToast] as Toast #CFD8DC
    component [LoadingSpinner] as Spinner #CFD8DC
    component [ConfirmDialog] as Dialog #CFD8DC
}

package "Map Components" #E8F5E9 {
    component [ProviderMap\n(Leaflet)] as Map #A5D6A7
    component [MapMarkers] as Markers #A5D6A7
    component [LocationPicker] as Location #A5D6A7
}

package "Services Layer" #FFF8E1 {
    component [API Client\n(Axios)] as API #FFE082
    component [Auth Service] as AuthSvc #FFE082
    component [Claims Service] as ClaimsSvc #FFE082
    component [Request Services] as ReqSvc #FFE082
}

' Connections
App --> Router
App --> Theme
App --> I18n
App --> Query

Router --> Protected
Protected --> AuthCtx
Protected --> MainLayout

MainLayout --> Sidebar
MainLayout --> Header
MainLayout --> Footer

Router --> Login
Router --> Register

MainLayout --> IMDash
MainLayout --> MADash
MainLayout --> CADash
MainLayout --> CLDash
MainLayout --> DOCDash
MainLayout --> PHDash
MainLayout --> LABDash
MainLayout --> RADDash
MainLayout --> EMDash

IMDash --> ClaimsList
CLDash --> SubmitClaim
MADash --> ClaimReview

DOCDash --> CreateRx
DOCDash --> CreateLab
DOCDash --> CreateRad
PHDash --> FulfillRx
LABDash --> Results
RADDash --> Results

EMDash --> EmergList
EMDash --> Triage
CLDash --> SubmitEmerg

ClaimsList --> DataTable
ClaimsList --> Search
SubmitClaim --> Forms
SubmitClaim --> Upload

Map --> Markers
CLDash --> Map

API --> AuthSvc
API --> ClaimsSvc
API --> ReqSvc

@enduml
```

---

## 22. API Endpoints Diagram

```plantuml
@startuml API_Endpoints
!theme plain
skinparam backgroundColor #FEFEFE

title REST API Endpoints Structure (Actual Implementation)

skinparam package {
    BackgroundColor #F5F5F5
    BorderColor #424242
}

skinparam rectangle {
    BackgroundColor #E3F2FD
    BorderColor #1565C0
}

package "Authentication API" #E8F5E9 {
    rectangle "POST /api/auth/register" as reg #C8E6C9
    rectangle "POST /api/auth/admin/register" as adminReg #C8E6C9
    rectangle "POST /api/auth/login" as login #C8E6C9
    rectangle "POST /api/auth/logout" as logout #C8E6C9
    rectangle "GET /api/auth/me" as authMe #C8E6C9
    rectangle "POST /api/auth/verify-email" as verify #C8E6C9
    rectangle "POST /api/auth/forgot-password" as forgot #C8E6C9
    rectangle "POST /api/auth/reset-password" as reset #C8E6C9
}

package "Client API" #E3F2FD {
    rectangle "GET /api/clients/list" as listClients #BBDEFB
    rectangle "GET /api/clients/me/update" as getMe #BBDEFB
    rectangle "PUT /api/clients/me/update" as updateMe #BBDEFB
    rectangle "GET /api/clients/search/employeeId/{id}" as searchEmp #BBDEFB
    rectangle "GET /api/clients/search/name/{name}" as searchName #BBDEFB
    rectangle "POST /api/clients/{id}/deactivate" as deactivate #BBDEFB
    rectangle "POST /api/clients/{id}/reactivate" as reactivate #BBDEFB
    rectangle "POST /api/clients/{id}/role-requests/approve" as approveRole #BBDEFB
}

package "Family Members API" #E1F5FE {
    rectangle "GET /api/family-members/my" as myFamily #B3E5FC
    rectangle "GET /api/family-members/pending" as pendingFamily #B3E5FC
    rectangle "POST /api/family-members/create" as createFamily #B3E5FC
    rectangle "POST /api/family-members/{id}/approve" as approveFamily #B3E5FC
    rectangle "POST /api/family-members/{id}/reject" as rejectFamily #B3E5FC
}

package "Healthcare Provider Claims API" #FFF3E0 {
    rectangle "GET /api/healthcare-provider-claims/my-claims" as myClaims #FFE0B2
    rectangle "GET /api/healthcare-provider-claims/medical-review" as medReview #FFE0B2
    rectangle "GET /api/healthcare-provider-claims/coordination-review" as coordReview #FFE0B2
    rectangle "GET /api/healthcare-provider-claims/final-decisions" as finalDec #FFE0B2
    rectangle "POST /api/healthcare-provider-claims/create" as createClaim #FFE0B2
    rectangle "POST /api/healthcare-provider-claims/client/create" as clientClaim #FFE0B2
    rectangle "POST /api/healthcare-provider-claims/admin/create-direct" as adminClaim #FFE0B2
    rectangle "POST /api/healthcare-provider-claims/{id}/approve-medical" as approveMed #FFE0B2
    rectangle "POST /api/healthcare-provider-claims/{id}/reject-medical" as rejectMed #FFE0B2
    rectangle "POST /api/healthcare-provider-claims/{id}/return-to-medical" as returnMed #FFE0B2
    rectangle "POST /api/healthcare-provider-claims/reports/pdf" as claimPdf #FFE0B2
}

package "Prescriptions API" #F3E5F5 {
    rectangle "GET /api/prescriptions/get" as getRx #E1BEE7
    rectangle "GET /api/prescriptions/all" as allRx #E1BEE7
    rectangle "GET /api/prescriptions/pending" as pendingRx #E1BEE7
    rectangle "POST /api/prescriptions/create" as createRx #E1BEE7
    rectangle "POST /api/prescriptions/{id}/verify" as verifyRx #E1BEE7
    rectangle "POST /api/prescriptions/{id}/bill" as billRx #E1BEE7
    rectangle "POST /api/prescriptions/{id}/reject" as rejectRx #E1BEE7
    rectangle "GET /api/prescriptions/available-items" as availItems #E1BEE7
    rectangle "GET /api/prescriptions/check-active/{name}/{medId}" as checkActive #E1BEE7
}

package "Lab Requests API" #E8EAF6 {
    rectangle "GET /api/labs/my-requests" as myLabs #C5CAE9
    rectangle "GET /api/labs/doctor/my" as doctorLabs #C5CAE9
    rectangle "GET /api/labs/pending" as pendingLabs #C5CAE9
    rectangle "GET /api/labs/getByMember" as memberLabs #C5CAE9
    rectangle "POST /api/labs/create" as createLab #C5CAE9
    rectangle "POST /api/labs/{id}/upload" as uploadLab #C5CAE9
    rectangle "GET /api/labs/available-tests" as labTests #C5CAE9
}

package "Radiology Requests API" #FCE4EC {
    rectangle "GET /api/radiology/my-requests" as myRad #F8BBD9
    rectangle "GET /api/radiology/doctor/my" as doctorRad #F8BBD9
    rectangle "GET /api/radiology/pending" as pendingRad #F8BBD9
    rectangle "GET /api/radiology/getByMember" as memberRad #F8BBD9
    rectangle "POST /api/radiology/create" as createRad #F8BBD9
    rectangle "POST /api/radiology/{id}/uploadResult" as uploadRad #F8BBD9
    rectangle "GET /api/radiology/available-tests" as radTests #F8BBD9
}

package "Emergency Requests API" #FFEBEE {
    rectangle "GET /api/emergencies/all" as allEmerg #FFCDD2
    rectangle "GET /api/emergencies/doctor/my-requests" as doctorEmerg #FFCDD2
    rectangle "POST /api/emergencies/create" as createEmerg #FFCDD2
}

package "Search Profiles API" #E0F7FA {
    rectangle "GET /api/search-profiles/all" as allProfiles #B2EBF2
    rectangle "GET /api/search-profiles/approved" as approvedProfiles #B2EBF2
    rectangle "GET /api/search-profiles/my-profiles" as myProfiles #B2EBF2
    rectangle "POST /api/search-profiles/create" as createProfile #B2EBF2
    rectangle "POST /api/search-profiles/{id}/approve" as approveProfile #B2EBF2
    rectangle "POST /api/search-profiles/{id}/reject" as rejectProfile #B2EBF2
}

package "Policy API" #FFFDE7 {
    rectangle "GET /api/policies/all" as listPolicies #FFF9C4
    rectangle "POST /api/policies/create" as createPolicy #FFF9C4
    rectangle "PUT /api/policies/update/{id}" as updatePolicy #FFF9C4
    rectangle "DELETE /api/policies/delete/{id}" as deletePolicy #FFF9C4
    rectangle "GET /api/policies/{id}/coverages/all" as coverages #FFF9C4
    rectangle "POST /api/policies/{id}/coverages/add" as addCoverage #FFF9C4
}

package "Price List API" #F1F8E9 {
    rectangle "GET /api/pricelist/{type}" as getPriceList #DCEDC8
    rectangle "POST /api/pricelist" as createPrice #DCEDC8
    rectangle "PUT /api/pricelist/{id}" as updatePrice #DCEDC8
    rectangle "DELETE /api/pricelist/{id}" as deletePrice #DCEDC8
}

package "Notifications API" #FFF8E1 {
    rectangle "GET /api/notifications" as getNotif #FFECB3
    rectangle "GET /api/notifications/unread-count" as unreadCount #FFECB3
    rectangle "GET /api/notifications/unread-count/emergency" as emergCount #FFECB3
    rectangle "POST /api/notifications/{id}/read" as readNotif #FFECB3
    rectangle "POST /api/notifications/read-all" as readAll #FFECB3
    rectangle "POST /api/notifications/{id}/reply" as replyNotif #FFECB3
}

package "Reports API" #ECEFF1 {
    rectangle "GET /api/reports/claims" as claimsReport #CFD8DC
    rectangle "GET /api/reports/financial" as finReport #CFD8DC
    rectangle "GET /api/reports/usage" as usageReport #CFD8DC
    rectangle "GET /api/reports/policies" as polReport #CFD8DC
    rectangle "GET /api/reports/members-activity" as actReport #CFD8DC
    rectangle "GET /api/reports/providers" as provReport #CFD8DC
}

package "Medical Admin API" #E8EAF6 {
    rectangle "GET /api/medical-admin/dashboard" as medDash #C5CAE9
    rectangle "GET /api/medical-admin/chronic-patients" as chronic #C5CAE9
    rectangle "GET /api/medical-admin/chronic-schedules" as schedules #C5CAE9
    rectangle "POST /api/medical-admin/create-chronic-schedule" as createSched #C5CAE9
}

package "Chat API" #F3E5F5 {
    rectangle "GET/POST /api/chat" as chat #E1BEE7
    rectangle "WS /ws-chat" as wsChat #E1BEE7
}

note bottom of createClaim
  **HTTP Methods:**
  GET - Retrieve data
  POST - Create/Action
  PUT - Update
  DELETE - Remove

  **Authorization:**
  JWT Bearer token required
  for all endpoints except
  /auth/login and /auth/register
end note

@enduml
```

---

## 23. Activity Diagram - Lab Request Processing

```plantuml
@startuml Lab_Request_Activity
!theme plain
skinparam backgroundColor #FEFEFE
skinparam activityArrowColor #1565C0
skinparam activityBackgroundColor #E3F2FD
skinparam activityBorderColor #1565C0

title Lab Request Processing Activity Diagram

|#E8F5E9|Doctor|
|#FFF9C4|System|
|#FFE0B2|Lab Technician|
|#E3F2FD|Client|

|Doctor|
start
:Select patient from list;
:Enter lab test details;
note right
  - Test name
  - Clinical notes
  - Diagnosis
  - Urgency level
end note
:Submit lab request;

|System|
:Validate doctor permissions;
if (Doctor authorized?) then (yes)
    :Validate patient insurance;
    if (Insurance active?) then (yes)
        :Save request to database;
        :Set status = PENDING;
        :Send notification to client;
        :Send notification to assigned lab;
    else (no)
        :Return insurance error;
        |Doctor|
        :Show error message;
        stop
    endif
else (no)
    :Return authorization error;
    |Doctor|
    :Show error message;
    stop
endif

|Client|
:Receive notification;
:View pending lab request;

|Lab Technician|
:View pending requests;
:Select request to process;
:Start processing;

|System|
:Update status = IN_PROGRESS;
:Notify client of status change;

|Lab Technician|
:Perform laboratory tests;
:Analyze samples;
:Prepare results;
:Enter test results;
note right
  - Test values
  - Reference ranges
  - Notes
  - Result file
end note
:Submit results;

|System|
:Validate result data;
:Save results to database;
:Update status = COMPLETED;
:Store result file;
:Notify doctor;
:Notify client;

|Client|
:Receive completion notification;
:View test results;
:Download result report;

|Doctor|
:Review patient results;
:Add to patient record;

|System|
:Results available for\nclaim documentation;
stop

@enduml
```

---

## 24. Activity Diagram - Radiology Request Processing

```plantuml
@startuml Radiology_Request_Activity
!theme plain
skinparam backgroundColor #FEFEFE
skinparam activityArrowColor #E65100
skinparam activityBackgroundColor #FFF3E0
skinparam activityBorderColor #E65100

title Radiology Request Processing Activity Diagram

|#E8F5E9|Doctor|
|#FFF9C4|System|
|#E1BEE7|Radiologist|
|#E3F2FD|Client|

|Doctor|
start
:Select patient;
:Choose imaging type;
note right
  - X-Ray
  - CT Scan
  - MRI
  - Ultrasound
  - Mammography
end note
:Enter clinical indication;
:Specify body region;
:Submit radiology order;

|System|
:Validate doctor authorization;
if (Authorized?) then (yes)
    :Check patient coverage;
    if (Imaging covered?) then (yes)
        :Save request (PENDING);
        :Identify nearest facility;
        :Send notifications;
    else (no)
        :Return coverage error;
        |Doctor|
        :Inform patient of\nnon-coverage;
        stop
    endif
else (no)
    :Return auth error;
    |Doctor|
    :Show error;
    stop
endif

|Client|
:Receive notification;
:View imaging order;
:Note prep instructions;

|Radiologist|
:View pending orders;
:Review order details;
:Schedule appointment;

|System|
:Update status = SCHEDULED;
:Send appointment to client;

|Client|
:Receive appointment;
:Arrive at facility;

|Radiologist|
:Verify patient identity;
:Begin imaging;

|System|
:Update status = IN_PROGRESS;

|Radiologist|
:Perform imaging procedure;
fork
    :Capture DICOM images;
fork again
    :Monitor image quality;
end fork
:Review captured images;
if (Images acceptable?) then (yes)
    :Analyze findings;
    :Write radiology report;
    :Upload images and report;

    |System|
    :Store files securely;
    :Update status = COMPLETED;
    :Save pricing information;
    :Notify stakeholders;
else (no)
    :Reschedule imaging;
    |System|
    :Update status = PENDING;
    :Notify client;
    stop
endif

|Client|
:Receive results notification;
:View imaging report;
:Download DICOM files;

|Doctor|
:Review imaging results;
:Plan treatment based\non findings;
:Add to patient record;

|System|
:Results available for\ninsurance claims;
stop

@enduml
```

---

## 25. Notification Flow Diagram

```plantuml
@startuml Notification_Flow
!theme plain
skinparam backgroundColor #FEFEFE

title System Notification Flow Diagram

skinparam rectangle {
    BackgroundColor #E3F2FD
    BorderColor #1565C0
}

package "Trigger Events" #E8F5E9 {
    rectangle "Claim Submitted" as E1 #C8E6C9
    rectangle "Status Changed" as E2 #C8E6C9
    rectangle "Claim Approved/Rejected" as E3 #C8E6C9
    rectangle "Prescription Created" as E4 #C8E6C9
    rectangle "Lab Results Ready" as E5 #C8E6C9
    rectangle "Emergency Reported" as E6 #FFCDD2
    rectangle "Role Request" as E7 #C8E6C9
    rectangle "Document Required" as E8 #C8E6C9
}

package "Notification Service" #FFF3E0 {
    rectangle "Event Handler" as Handler #FFE0B2
    rectangle "Recipient Resolver" as Resolver #FFE0B2
    rectangle "Template Engine" as Template #FFE0B2
    rectangle "Channel Router" as Router #FFE0B2
}

package "Notification Channels" #E3F2FD {
    rectangle "Email Service\n(SMTP)" as Email #BBDEFB
    rectangle "Push Notifications\n(Browser/Mobile)" as Push #BBDEFB
    rectangle "In-App Notifications\n(Real-time)" as InApp #BBDEFB
    rectangle "SMS Gateway\n(Emergency only)" as SMS #FFCDD2
}

package "Recipients" #F3E5F5 {
    rectangle "Client" as RClient #E1BEE7
    rectangle "Doctor" as RDoctor #E1BEE7
    rectangle "Pharmacist" as RPharm #E1BEE7
    rectangle "Lab Technician" as RLab #E1BEE7
    rectangle "Radiologist" as RRad #E1BEE7
    rectangle "Medical Admin" as RMedAdmin #E1BEE7
    rectangle "Coord Admin" as RCoordAdmin #E1BEE7
    rectangle "Insurance Manager" as RInsMgr #E1BEE7
    rectangle "Emergency Manager" as REmergMgr #FFCDD2
}

' Event flows
E1 --> Handler
E2 --> Handler
E3 --> Handler
E4 --> Handler
E5 --> Handler
E6 --> Handler
E7 --> Handler
E8 --> Handler

Handler --> Resolver
Resolver --> Template
Template --> Router

Router --> Email
Router --> Push
Router --> InApp
Router --> SMS

' Channel to recipient flows
Email --> RClient
Email --> RDoctor
Email --> RMedAdmin
Email --> RInsMgr

Push --> RClient
Push --> RDoctor
Push --> RPharm
Push --> RLab
Push --> RRad

InApp --> RClient
InApp --> RDoctor
InApp --> RPharm
InApp --> RLab
InApp --> RRad
InApp --> RMedAdmin
InApp --> RCoordAdmin
InApp --> RInsMgr

SMS --> REmergMgr
SMS --> RClient

note right of E6
  **Emergency Priority:**
  SMS + Push + In-App
  sent simultaneously
end note

note bottom of Router
  **Channel Selection:**
  • Email: Detailed notifications
  • Push: Real-time alerts
  • In-App: Dashboard updates
  • SMS: Emergencies only
end note

@enduml
```

---

## 26. Data Flow Diagram - Level 1

```plantuml
@startuml DFD_Level1
!theme plain
skinparam backgroundColor #FEFEFE

title Data Flow Diagram - Level 1 (Detailed)

skinparam rectangle {
    RoundCorner 25
}

' External Entities
actor "Client/Member" as Client #A5D6A7
actor "Healthcare Provider\n(Doctor/Pharmacist/Lab/Rad)" as Provider #90CAF9
actor "Insurance Staff\n(Manager/Admin)" as Staff #FFB74D

' Processes
rectangle "1.0\nUser Management" as P1 #E1BEE7
rectangle "2.0\nClaims Processing" as P2 #BBDEFB
rectangle "3.0\nPrescription\nManagement" as P3 #C8E6C9
rectangle "4.0\nLab/Radiology\nManagement" as P4 #FFF9C4
rectangle "5.0\nEmergency\nHandling" as P5 #FFCDD2
rectangle "6.0\nPolicy\nManagement" as P6 #B2DFDB
rectangle "7.0\nReporting &\nAnalytics" as P7 #D7CCC8

' Data Stores
database "D1: Clients" as D1 #ECEFF1
database "D2: Claims" as D2 #ECEFF1
database "D3: Prescriptions" as D3 #ECEFF1
database "D4: Lab/Radiology\nRequests" as D4 #ECEFF1
database "D5: Emergency\nRequests" as D5 #ECEFF1
database "D6: Policies" as D6 #ECEFF1
database "D7: Audit Logs" as D7 #ECEFF1

' Client flows
Client --> P1 : Registration data
P1 --> Client : Account confirmation
Client --> P2 : Claim submission
P2 --> Client : Claim status
Client --> P5 : Emergency request
P5 --> Client : Emergency status

' Provider flows
Provider --> P2 : Service claims
P2 --> Provider : Payment status
Provider --> P3 : Prescriptions
P3 --> Provider : Fulfillment status
Provider --> P4 : Lab/Radiology orders
P4 --> Provider : Test results

' Staff flows
Staff --> P2 : Review decisions
P2 --> Staff : Claims for review
Staff --> P6 : Policy updates
P6 --> Staff : Policy data
Staff --> P7 : Report requests
P7 --> Staff : Generated reports

' Process to Data Store flows
P1 <--> D1 : Client records
P2 <--> D2 : Claim records
P3 <--> D3 : Prescription records
P4 <--> D4 : Request records
P5 <--> D5 : Emergency records
P6 <--> D6 : Policy records

' Cross-process flows
P2 --> P1 : Coverage verification
P3 --> P2 : Prescription claim data
P4 --> P2 : Lab/Rad claim data
P5 --> P2 : Emergency claim data

' Audit logging
P1 --> D7 : User actions
P2 --> D7 : Claim actions
P6 --> D7 : Policy changes

note right of P2
  **Claims Processing includes:**
  - Medical Review
  - Coordination Review
  - Final Approval
  - Payment Calculation
end note

note right of P4
  **Lab/Radiology includes:**
  - Test ordering
  - Sample processing
  - Result entry
  - Report generation
end note

@enduml
```

---

## Notes for Report

### How to Generate These Diagrams:

1. **Online Tools:**
   - PlantUML Online Server: https://www.plantuml.com/plantuml/uml/
   - PlantText: https://www.planttext.com/

2. **IDE Plugins:**
   - VS Code: PlantUML extension
   - IntelliJ IDEA: PlantUML integration

3. **Command Line:**
   ```bash
   java -jar plantuml.jar diagram.puml
   ```

### Diagram Descriptions:

| # | Diagram | Purpose |
|---|---------|---------|
| 1 | ER Diagram | Shows database schema with all 20+ tables and relationships |
| 2 | Use Case Diagram | Maps all 9 actors to their available system functions |
| 3 | Class Diagram | Shows entity classes with attributes and relationships |
| 4 | Sequence - Claims | Shows the multi-step claim approval workflow |
| 5 | Sequence - Prescription | Shows prescription creation and fulfillment |
| 6 | Activity - Registration | Shows user registration flow with email verification |
| 7 | Activity - Claims | Shows complete claims processing workflow |
| 8 | State - Claim | Shows claim status transitions |
| 9 | State - Prescription | Shows prescription status lifecycle |
| 10 | Component Diagram | Shows system component architecture |
| 11 | Deployment Diagram | Shows physical deployment topology |
| 12 | DFD Context | Shows system context and data flows |
| 13 | Architecture Overview | High-level system architecture |
| 14 | Sequence - Lab Request | Shows lab request creation, processing, and result delivery workflow |
| 15 | Sequence - Radiology Request | Shows radiology imaging order, processing, and results workflow |
| 16 | Sequence - Emergency Request | Shows emergency submission, triage, and approval workflow |
| 17 | State - Lab Request | Shows lab request status transitions (Pending → In Progress → Completed) |
| 18 | State - Radiology Request | Shows radiology request status lifecycle with scheduling |
| 19 | State - Emergency Request | Shows emergency request status transitions with priority handling |
| 20 | Role Permission Matrix | Visual representation of all 9 roles and their 113+ permissions |
| 21 | Frontend Architecture | React component hierarchy and module organization |
| 22 | API Endpoints | Complete REST API endpoint structure by category |
| 23 | Activity - Lab Processing | Detailed lab request processing flow with all actors |
| 24 | Activity - Radiology Processing | Detailed radiology imaging workflow with all actors |
| 25 | Notification Flow | System notification architecture and channel routing |
| 26 | DFD Level 1 | Detailed data flow between processes and data stores |

