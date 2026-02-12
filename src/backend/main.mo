import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

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
  };

  public type UserProfile = {
    name : Text;
  };

  let inquiries = Map.empty<Nat, Inquiry>();
  var nextId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
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

  // Public inquiry submission - accessible to anyone including guests
  public shared ({ caller }) func submitInquiry(
    inquiryType : InquiryType,
    name : Text,
    phoneNumber : Text,
    email : ?Text,
    message : Text,
    serviceCategory : ?Text
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
    };
    inquiries.add(id, newInquiry);
    nextId += 1;
    id;
  };

  // Admin-only internal inquiry submission
  public shared ({ caller }) func submitInternalInquiry(
    inquiryType : InquiryType,
    name : Text,
    phoneNumber : Text,
    email : ?Text,
    message : Text,
    serviceCategory : ?Text
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can submit internal inquiries");
    };

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
      internal = true;
    };
    inquiries.add(id, newInquiry);
    nextId += 1;
    id;
  };

  // Admin-only inquiry retrieval
  public query ({ caller }) func getInquiry(id : Nat) : async Inquiry {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view inquiries");
    };

    switch (inquiries.get(id)) {
      case (?inquiry) {
        inquiry;
      };
      case (_) { Runtime.trap("Inquiry not found") };
    };
  };

  // Admin-only: get all inquiries
  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all inquiries");
    };
    inquiries.values().toArray();
  };

  // Admin-only: get public inquiries
  public query ({ caller }) func getPublicInquiries() : async [Inquiry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view inquiries");
    };
    inquiries.values().toArray().filter<Inquiry>(func(inq) { not inq.internal });
  };

  // Admin-only: get first N public inquiries
  public query ({ caller }) func getFirstPublicInquiries(amount : Nat) : async [Inquiry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view inquiries");
    };
    let publicInquiries = inquiries.values().toArray().filter(func(inq) { not inq.internal });
    if (amount >= publicInquiries.size()) {
      return publicInquiries;
    };
    Array.tabulate<Inquiry>(amount, func(i) { publicInquiries[i] });
  };

  // Admin-only: get first N internal inquiries
  public query ({ caller }) func getFirstPublicInternalInquiries(amount : Nat) : async [Inquiry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view internal inquiries");
    };
    let internalInquiries = inquiries.values().toArray().filter(func(inq) { inq.internal });
    if (amount >= internalInquiries.size()) {
      return internalInquiries;
    };
    Array.tabulate<Inquiry>(amount, func(i) { internalInquiries[i] });
  };

  // Admin-only: update inquiry
  public shared ({ caller }) func updateInquiry(id : Nat, updatedInquiry : Inquiry) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update inquiries");
    };

    switch (inquiries.get(id)) {
      case (?_) {
        inquiries.add(id, updatedInquiry);
      };
      case (_) {
        Runtime.trap("Inquiry not found");
      };
    };
  };

  // Admin-only: delete inquiry
  public shared ({ caller }) func deleteInquiry(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete inquiries");
    };

    switch (inquiries.get(id)) {
      case (?_) {
        inquiries.remove(id);
      };
      case (_) {
        Runtime.trap("Inquiry not found");
      };
    };
  };
};
