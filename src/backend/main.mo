import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
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

  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var inquiries = Map.empty<Nat, Inquiry>();
  var nextId = 0;
  include MixinAuthorization(accessControlState);

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
    if (not isAdminSafe(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    inquiries.values().toArray();
  };

  public shared ({ caller }) func setInquiryReadStatus(inquiryId : Nat, read : Bool) : async () {
    if (not isAdminSafe(caller)) {
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
    if (not isAdminSafe(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (inquiries.get(inquiryId)) {
      case (null) { Runtime.trap("Inquiry with id " # inquiryId.toText() # " does not exist.") };
      case (?_inquiry) {
        inquiries.remove(inquiryId);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminSafe(caller)) {
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

  func isAdminSafe(caller : Principal) : Bool {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin) { true };
      case (_) { false };
    };
  };
};
