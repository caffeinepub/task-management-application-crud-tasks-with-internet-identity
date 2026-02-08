import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type TaskId = Nat;
  type SubtaskId = Nat;

  type TaskStatus = {
    #open;
    #inProgress;
    #completed;
    #archived;
  };

  type TaskPriority = {
    #low;
    #medium;
    #high;
    #urgent;
  };

  type Subtask = {
    id : SubtaskId;
    title : Text;
    isCompleted : Bool;
  };

  type NewTask = {
    id : TaskId;
    title : Text;
    description : Text;
    dueDate : Int;
    status : TaskStatus;
    priority : TaskPriority;
    tags : [Text];
    createdAt : Int;
    updatedAt : Int;
    createdBy : Principal;
    assignedTo : ?Principal;
    orderKey : ?Nat;
    subtasks : [Subtask];
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    nextTaskId : Map.Map<Principal, TaskId>;
    nextSubtaskId : Map.Map<Principal, SubtaskId>;
    userTasks : Map.Map<Principal, Map.Map<TaskId, NewTask>>;
  };

  type OldTask = {
    id : Nat;
    title : Text;
    description : Text;
    dueDate : ?Int;
    completed : Bool;
    createdAt : Int;
    completionTimestamp : ?Int;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    nextTaskId : Map.Map<Principal, TaskId>;
    userTasks : Map.Map<Principal, Map.Map<TaskId, OldTask>>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserTasks = old.userTasks.map<Principal, Map.Map<TaskId, OldTask>, Map.Map<TaskId, NewTask>>(
      func(user, oldTasks) {
        let newTasks = oldTasks.map<TaskId, OldTask, NewTask>(
          func(id, oldTask) {
            {
              id = oldTask.id;
              title = oldTask.title;
              description = oldTask.description;
              dueDate = switch (oldTask.dueDate) {
                case (null) { 0 };
                case (?date) { date };
              };
              status = if (oldTask.completed) { #completed } else { #open };
              priority = #medium;
              tags = [];
              createdAt = oldTask.createdAt;
              updatedAt = Time.now();
              createdBy = user;
              assignedTo = null;
              orderKey = null;
              subtasks = [];
            };
          }
        );
        newTasks;
      }
    );

    { old with
      nextSubtaskId = Map.empty<Principal, SubtaskId>();
      userTasks = newUserTasks;
    };
  };
};
