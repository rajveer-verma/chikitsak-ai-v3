# Firebase Setup Guide for Chikitsak AI

To make the **Authentication**, **Appointments**, **Prescriptions**, **Medications**, and **Health Analytics** features work, configure **Email/Password** sign-in and **Cloud Firestore Security Rules** in your Firebase Console.

Follow these simple steps:

---

### Step 1: Enable Email/Password Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`chikitsak-ai`**.
3. In the left-hand sidebar, under **Build**, click on **Authentication**.
4. Click on the **Sign-in method** tab at the top.
5. Click the **Add new provider** button (or click **Email/Password** if already listed).
6. Toggle the **Email/Password** switch to **Enabled** (leave "Email link" disabled).
7. Click **Save**.

---

### Step 2: Configure Firestore Database Rules

1. In the left-hand sidebar of your Firebase Console, under **Build**, click on **Firestore Database**.
2. Click on the **Rules** tab at the top.
3. Replace the rules with the following configuration:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Verify appointment participation via parent document lookup
    function isAppointmentParticipant(appointmentId) {
      let appointmentDoc = get(/databases/$(database)/documents/appointments/$(appointmentId)).data;
      return isAuthenticated() && (
        request.auth.uid == appointmentDoc.patientUid || 
        request.auth.uid == appointmentDoc.doctorUid
      );
    }

    // ==========================================
    // 1. User Profiles (/profiles/{userId})
    // ==========================================
    match /profiles/{userId} {
      // Authenticated users can discover doctors and view registered patient lists
      allow read: if isAuthenticated();
      // Profile creation only for the authenticated user
      allow create: if isOwner(userId);
      // Profile updates by owner only; prevent unauthorized role escalation
      allow update: if isOwner(userId) && (
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']) ||
        request.resource.data.role == resource.data.role
      );
      // Profile deletion by owner only
      allow delete: if isOwner(userId);
    }

    // ==========================================
    // 2. Appointments (/appointments/{appointmentId})
    // ==========================================
    match /appointments/{appointmentId} {
      // Only the appointment's participating patient or doctor can read
      allow read: if isAuthenticated() && (
        resource.data.patientUid == request.auth.uid || 
        resource.data.doctorUid == request.auth.uid
      );
      // Patients create appointments for themselves
      allow create: if isAuthenticated() && (
        request.resource.data.patientUid == request.auth.uid
      );
      // Status/notes/prescription/chat metadata updates by participants; prevent modifying patientUid/doctorUid ownership
      allow update: if isAuthenticated() && (
        resource.data.patientUid == request.auth.uid || 
        resource.data.doctorUid == request.auth.uid
      ) && (
        request.resource.data.patientUid == resource.data.patientUid &&
        request.resource.data.doctorUid == resource.data.doctorUid
      );
      // Cancellation / deletion by participating patient or doctor
      allow delete: if isAuthenticated() && (
        resource.data.patientUid == request.auth.uid || 
        resource.data.doctorUid == request.auth.uid
      );

      // ==========================================
      // 2a. Live Chat Subcollection (/messages/{messageId})
      // ==========================================
      match /messages/{messageId} {
        // Read messages only if the user is a participant of the parent appointment
        allow read: if isAppointmentParticipant(appointmentId);
        // Create messages only if participant of the parent appointment
        allow create: if isAppointmentParticipant(appointmentId) && (
          request.resource.data.senderId == request.auth.uid ||
          request.resource.data.sender == 'doctor' ||
          request.resource.data.sender == 'patient'
        );
        // Updates / deletes restricted to participants of the parent appointment
        allow update, delete: if isAppointmentParticipant(appointmentId);
      }
    }

    // ==========================================
    // 3. Doctor Prescriptions (/prescriptions/{prescriptionId})
    // ==========================================
    match /prescriptions/{prescriptionId} {
      // Prescriptions readable by issuing doctor or recipient patient
      allow read: if isAuthenticated() && (
        resource.data.doctorUid == request.auth.uid || 
        resource.data.patientUid == request.auth.uid
      );
      // Create strictly enforced to the issuing doctor
      allow create: if isAuthenticated() && request.resource.data.doctorUid == request.auth.uid;
      // Update/delete restricted to the issuing doctor, preserving doctorUid
      allow update: if isAuthenticated() && resource.data.doctorUid == request.auth.uid && (
        request.resource.data.doctorUid == resource.data.doctorUid
      );
      allow delete: if isAuthenticated() && resource.data.doctorUid == request.auth.uid;
    }

    // ==========================================
    // 4. Doctor Medications (/medications/{medicationId})
    // ==========================================
    match /medications/{medicationId} {
      // Medications readable by issuing doctor or recipient patient
      allow read: if isAuthenticated() && (
        resource.data.doctorUid == request.auth.uid || 
        resource.data.patientUid == request.auth.uid
      );
      // Create strictly enforced to the issuing doctor
      allow create: if isAuthenticated() && request.resource.data.doctorUid == request.auth.uid;
      // Update/delete restricted to the issuing doctor, preserving doctorUid
      allow update: if isAuthenticated() && resource.data.doctorUid == request.auth.uid && (
        request.resource.data.doctorUid == resource.data.doctorUid
      );
      allow delete: if isAuthenticated() && resource.data.doctorUid == request.auth.uid;
    }

    // ==========================================
    // 5. Patient Health Metrics (/healthMetrics/{metricId})
    // ==========================================
    match /healthMetrics/{metricId} {
      // Health metrics readable strictly by the patient owner
      allow read: if isAuthenticated() && resource.data.patientUid == request.auth.uid;
      // Create strictly enforced to the authenticated patient
      allow create: if isAuthenticated() && request.resource.data.patientUid == request.auth.uid;
      // Update/delete strictly by patient owner, preserving patientUid
      allow update: if isAuthenticated() && resource.data.patientUid == request.auth.uid && (
        request.resource.data.patientUid == resource.data.patientUid
      );
      allow delete: if isAuthenticated() && resource.data.patientUid == request.auth.uid;
    }
  }
}
```

4. Click **Publish** at the top right to deploy the new rules.

> [!IMPORTANT]
> **Deployment Status:** These rules are documented in this guide and must be published directly in the Firebase Console under **Firestore Database** $\rightarrow$ **Rules** tab unless Firebase CLI deployment (`firebase deploy --only firestore:rules`) has been executed.

---

### Step 3: Test Login & Signup!
Once both steps are completed, refresh your browser at `http://localhost:8080/login?role=patient`, and sign up. Your profile and records will be saved directly into Cloud Firestore!
