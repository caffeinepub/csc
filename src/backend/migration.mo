import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Inquiry = {
    id : Nat;
    timestamp : Int;
    inquiryType : {
      #contact;
      #serviceRequest;
    };
    name : Text;
    phoneNumber : Text;
    email : ?Text;
    message : Text;
    serviceCategory : ?Text;
    internal : Bool;
    read : Bool;
  };

  type Actor = {
    nextId : Nat;
    inquiries : Map.Map<Nat, Inquiry>;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
