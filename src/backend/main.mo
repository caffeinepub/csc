import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply data migration on upgrades
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type InquiryType = {
    #contact;
    #serviceRequest;
  };

  public type Inquiry = {
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

  public type UserProfile = {
    name : Text;
  };

  var nextId = 0;
  let inquiries = Map.empty<Nat, Inquiry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Admin secret token for authentication
  let ADMIN_SECRET = "admin-secret-token-2024";

  // Initialize caller as admin using secret token
  public shared ({ caller }) func initializeAccessControlWithSecret(secret : Text) : async () {
    if (secret != ADMIN_SECRET) {
      Runtime.trap("Unauthorized: Invalid secret token");
    };
    // Grant admin role to the caller
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access all inquiries");
    };
    inquiries.values().toArray();
  };

  public shared ({ caller }) func setInquiryReadStatus(inquiryId : Nat, read : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can change inquiry status");
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete inquiries");
    };
    switch (inquiries.get(inquiryId)) {
      case (null) { Runtime.trap("Inquiry with id " # inquiryId.toText() # " does not exist.") };
      case (?_inquiry) {
        inquiries.remove(inquiryId);
      };
    };
  };
};
