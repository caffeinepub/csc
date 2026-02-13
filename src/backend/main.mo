import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  type InquiryType = {
    #contact;
    #serviceRequest;
  };

  type Inquiry = {
    id : Nat;
    timestamp : Time.Time;
    inquiryType : InquiryType;
    name : Text;
    phoneNumber : Text;
    email : ?Text;
    message : Text;
    serviceCategory : ?Text;
    internal : Bool;
    read : Bool;
  };

  type UserProfile = {
    name : Text;
  };

  let OFFICIAL_ADMIN_USER_ID = "K107172621";

  var stableInquiries : [(Nat, Inquiry)] = [];
  var stableNextId : Nat = 0;
  var stableSuperAdminPrincipals : [Principal] = [];

  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let superAdminPrincipals = Map.empty<Principal, Bool>();

  var inquiries = Map.empty<Nat, Inquiry>();
  var nextId = 0;

  include MixinAuthorization(accessControlState);

  system func preupgrade() {
    stableInquiries := inquiries.toArray();
    stableNextId := nextId;
    stableSuperAdminPrincipals := superAdminPrincipals.entries()
      .filter(func(entry : (Principal, Bool)) : Bool { entry.1 })
      .map(func(entry : (Principal, Bool)) : Principal { entry.0 })
      .toArray();
  };

  system func postupgrade() {
    inquiries.clear();
    for ((id, inquiry) in stableInquiries.vals()) {
      inquiries.add(id, inquiry);
    };
    nextId := stableNextId;

    superAdminPrincipals.clear();
    for (principal in stableSuperAdminPrincipals.vals()) {
      superAdminPrincipals.add(principal, true);
    };

    stableInquiries := [];
    stableSuperAdminPrincipals := [];
  };

  type UserEntity = {
    id : Text;
    name : Text;
    email : ?Text;
    role : Text;
    createdAt : Time.Time;
    modifiedAt : ?Time.Time;
  };

  type SessionEntity = {
    id : Text;
    user : UserEntity;
    createdAt : Time.Time;
    modifiedAt : ?Time.Time;
  };

  public shared ({ caller }) func initializeAdmin(userId : Text) : async ?SessionEntity {
    if (userId == OFFICIAL_ADMIN_USER_ID) {
      superAdminPrincipals.add(caller, true);
      let now = Time.now();
      let adminUser : UserEntity = {
        id = OFFICIAL_ADMIN_USER_ID;
        name = "Owner";
        email = ?"";
        role = "admin";
        createdAt = now;
        modifiedAt = ?now;
      };

      let adminSession : SessionEntity = {
        id = caller.toText();
        user = adminUser;
        createdAt = now;
        modifiedAt = ?now;
      };

      return ?adminSession;
    };
    null;
  };

  func isAuthorizedAdmin(caller : Principal) : Bool {
    switch (superAdminPrincipals.get(caller)) {
      case (?true) { true };
      case (_) { AccessControl.isAdmin(accessControlState, caller) };
    };
  };

  public shared ({ caller }) func submitInquiry(
    inquiryType : InquiryType,
    name : Text,
    phoneNumber : Text,
    email : ?Text,
    message : Text,
    serviceCategory : ?Text,
  ) : async Nat {
    let id = nextId;
    let newInquiry : Inquiry = {
      id;
      timestamp = Time.now();
      inquiryType;
      name;
      phoneNumber;
      email;
      message;
      serviceCategory;
      internal = false;
      read = false;
    };
    inquiries.add(id, newInquiry);
    nextId += 1;
    id;
  };

  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    if (not (isAuthorizedAdmin(caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let inquiryCount = inquiries.size();
    if (inquiryCount == 0) {
      let demoInquiry : Inquiry = {
        id = 0;
        timestamp = Time.now();
        inquiryType = #contact;
        name = "Demo Inquiry";
        phoneNumber = "1234567890";
        email = ?"demo@example.com";
        message = "This is a demo inquiry to demonstrate the system's functionality when no actual data exists.";
        serviceCategory = ?"Demo Category";
        internal = false;
        read = false;
      };
      return [demoInquiry];
    };
    inquiries.values().toArray();
  };

  public shared ({ caller }) func setInquiryReadStatus(inquiryId : Nat, read : Bool) : async () {
    if (not (isAuthorizedAdmin(caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (inquiries.get(inquiryId)) {
      case (null) { Runtime.trap("Inquiry with id " # inquiryId.toText() # " does not exist.") };
      case (?inquiry) {
        let updatedInquiry : Inquiry = { inquiry with read };
        inquiries.add(inquiryId, updatedInquiry);
      };
    };
  };

  public shared ({ caller }) func deleteInquiry(inquiryId : Nat) : async () {
    if (not (isAuthorizedAdmin(caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (inquiries.get(inquiryId)) {
      case (null) { Runtime.trap("Inquiry with id " # inquiryId.toText() # " does not exist.") };
      case (?_inquiry) { inquiries.remove(inquiryId) };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (isAuthorizedAdmin(caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getHealthStatus() : async Text {
    ignore caller;
    ignore Time.now();
    "healthy";
  };

  public query ({ caller }) func isAdminCall() : async Bool {
    isAuthorizedAdmin(caller);
  };

  public query ({ caller }) func isAuthorizedAdminQuery() : async Bool {
    isAuthorizedAdmin(caller);
  };
};

