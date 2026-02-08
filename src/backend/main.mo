import Migration "migration";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
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

  type TaskId = Nat;
  type SubtaskId = Nat;

  public type TaskStatus = {
    #open;
    #inProgress;
    #completed;
    #archived;
  };

  public type TaskPriority = {
    #low;
    #medium;
    #high;
    #urgent;
  };

  public type Subtask = {
    id : SubtaskId;
    title : Text;
    isCompleted : Bool;
  };

  module Subtask {
    public func equal(a : Subtask, b : Subtask) : Bool {
      a.id == b.id and a.title == b.title and a.isCompleted == b.isCompleted;
    };
  };

  public type Task = {
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

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Int.compare(task1.createdAt, task2.createdAt);
    };

    public func compareByDueDate(task1 : Task, task2 : Task) : Order.Order {
      Int.compare(task1.dueDate, task2.dueDate);
    };

    public func compareByOrderKey(task1 : Task, task2 : Task) : Order.Order {
      switch (task1.orderKey, task2.orderKey) {
        case (?order1, ?order2) { Nat.compare(order1, order2) };
        case (?_, null) { #less };
        case (null, ?_) { #greater };
        case (null, null) { Int.compare(task1.createdAt, task2.createdAt) };
      };
    };
  };

  let nextTaskId = Map.empty<Principal, TaskId>();
  let nextSubtaskId = Map.empty<Principal, SubtaskId>();
  let userTasks = Map.empty<Principal, Map.Map<TaskId, Task>>();

  func getTasksForUser(user : Principal) : Map.Map<TaskId, Task> {
    switch (userTasks.get(user)) {
      case (null) {
        let newTasks = Map.empty<TaskId, Task>();
        userTasks.add(user, newTasks);
        newTasks;
      };
      case (?tasks) { tasks };
    };
  };

  func getAndIncrementTaskId(user : Principal) : TaskId {
    switch (nextTaskId.get(user)) {
      case (null) {
        nextTaskId.add(user, 2);
        1;
      };
      case (?currentId) {
        nextTaskId.add(user, currentId + 1);
        currentId;
      };
    };
  };

  func getAndIncrementSubtaskId(user : Principal) : SubtaskId {
    switch (nextSubtaskId.get(user)) {
      case (null) {
        nextSubtaskId.add(user, 2);
        1;
      };
      case (?currentId) {
        nextSubtaskId.add(user, currentId + 1);
        currentId;
      };
    };
  };

  public shared ({ caller }) func createTask(
    title : Text,
    description : Text,
    dueDate : Int,
    priority : TaskPriority,
    tags : [Text],
  ) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    let now = Time.now();
    let task : Task = {
      id = getAndIncrementTaskId(caller);
      title;
      description;
      dueDate;
      status = #open;
      priority;
      tags;
      createdAt = now;
      updatedAt = now;
      createdBy = caller;
      assignedTo = null;
      orderKey = null;
      subtasks = [];
    };
    getTasksForUser(caller).add(task.id, task);
    task;
  };

  public shared ({ caller }) func updateTask(
    taskId : TaskId,
    title : Text,
    description : Text,
    dueDate : Int,
    priority : TaskPriority,
    tags : [Text],
  ) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    let tasks = getTasksForUser(caller);
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existingTask) {
        let updatedTask = {
          existingTask with
          title;
          description;
          dueDate;
          priority;
          tags;
          updatedAt = Time.now();
        };
        tasks.add(taskId, updatedTask);
        updatedTask;
      };
    };
  };

  public shared ({ caller }) func updateTaskStatus(taskId : TaskId, newStatus : TaskStatus) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    let tasks = getTasksForUser(caller);
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedTask = { task with status = newStatus; updatedAt = Time.now() };
        tasks.add(taskId, updatedTask);
        updatedTask;
      };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    let tasks = getTasksForUser(caller);
    if (not tasks.containsKey(taskId)) { Runtime.trap("Task not found") };
    tasks.remove(taskId);
  };

  // Subtask API
  public shared ({ caller }) func addSubtask(taskId : TaskId, title : Text) : async Subtask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };

    let tasks = getTasksForUser(caller);
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let subtask : Subtask = {
          id = getAndIncrementSubtaskId(caller);
          title;
          isCompleted = false;
        };
        let updatedTask = { task with subtasks = task.subtasks.concat([subtask]) };
        tasks.add(taskId, updatedTask);
        subtask;
      };
    };
  };

  public shared ({ caller }) func updateSubtask(taskId : TaskId, subtaskId : SubtaskId, title : Text) : async Subtask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };

    let tasks = getTasksForUser(caller);
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedSubtasks = task.subtasks.map(
          func(st) {
            if (st.id == subtaskId) {
              { st with title };
            } else { st };
            });
        if (updatedSubtasks.equal(task.subtasks, )) {
          Runtime.trap("Subtask not found");
        };

        let updatedTask = { task with subtasks = updatedSubtasks };
        tasks.add(taskId, updatedTask);

        switch (updatedSubtasks.find(func(st) { st.id == subtaskId })) {
          case (null) { Runtime.trap("Subtask not found after update") };
          case (?subtask) { subtask };
        };
      };
    };
  };

  public shared ({ caller }) func toggleSubtaskCompletion(taskId : TaskId, subtaskId : SubtaskId) : async Subtask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };

    let tasks = getTasksForUser(caller);
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedSubtasks = task.subtasks.map(
          func(st) {
            if (st.id == subtaskId) {
              { st with isCompleted = not st.isCompleted };
            } else { st };
            });
        if (updatedSubtasks.equal(task.subtasks, )) {
          Runtime.trap("Subtask not found");
        };

        let updatedTask = { task with subtasks = updatedSubtasks };
        tasks.add(taskId, updatedTask);

        switch (updatedSubtasks.find(func(st) { st.id == subtaskId })) {
          case (null) { Runtime.trap("Subtask not found after toggle") };
          case (?subtask) { subtask };
        };
      };
    };
  };

  public shared ({ caller }) func deleteSubtask(taskId : TaskId, subtaskId : SubtaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };

    let tasks = getTasksForUser(caller);
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let filteredSubtasks = task.subtasks.filter(
          func(st) { st.id != subtaskId }
        );
        if (filteredSubtasks.size() == task.subtasks.size()) {
          Runtime.trap("Subtask not found");
        };
        let updatedTask = { task with subtasks = filteredSubtasks };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  // Kanban Column Reordering
  public shared ({ caller }) func updateTaskOrder(status : TaskStatus, orderedTaskIds : [TaskId]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };

    let tasks = getTasksForUser(caller);
    let tasksArray = tasks.values().toArray();

    // Only update orderKey for tasks with the same status
    let filteredIds = orderedTaskIds.filter(
      func(taskId) {
        switch (tasks.get(taskId)) {
          case (null) { false };
          case (?task) {
            switch (task.status, status) {
              case (#open, #open) { true };
              case (#inProgress, #inProgress) { true };
              case (#completed, #completed) { true };
              case (#archived, #archived) { true };
              case (_, _) { false };
            };
          };
        };
      }
    );

    // Update orderKey values for filtered task IDs
    for (i in filteredIds.keys()) {
      let taskId = filteredIds[i];
      switch (tasks.get(taskId)) {
        case (null) {};
        case (?task) {
          let updatedTask = {
            task with
            orderKey = ?(i + 1);
            updatedAt = Time.now();
          };
          tasks.add(taskId, updatedTask);
        };
      };
    };
  };

  // Query Methods
  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    let tasks = getTasksForUser(caller).values().toArray();
    tasks.sort();
  };

  public query ({ caller }) func getTasksByStatus(status : TaskStatus) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    let filteredTasks = getTasksForUser(caller).values().toArray().filter(
      func(task) { task.status == status }
    );
    filteredTasks.sort(Task.compareByOrderKey);
  };

  public query ({ caller }) func getTasksSortedByDueDate() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    let tasks = getTasksForUser(caller).values().toArray();
    tasks.sort(Task.compareByDueDate);
  };

  public query ({ caller }) func getTaskCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    getTasksForUser(caller).size();
  };

  public query ({ caller }) func getCompletedTaskCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Sign-in required to access tasks");
    };
    var count = 0;
    for (task in getTasksForUser(caller).values()) {
      if (task.status == #completed) { count += 1 };
    };
    count;
  };
};
