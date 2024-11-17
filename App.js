import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  const saveTasksToStorage = async (items) => {
    try {
      const jsonValue = JSON.stringify(items);
      await AsyncStorage.setItem("@tasks", jsonValue);
    } catch (e) {
      console.error("Error saving tasks:", e);
    }
  };

  const loadTasksFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@tasks");
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Error loading tasks:", e);
      return [];
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await loadTasksFromStorage();
      setTasks(
        storedTasks.map((task) => ({
          ...task,
          fadeAnim: new Animated.Value(1),
        }))
      );
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    saveTasksToStorage(tasks.map(({ fadeAnim, ...rest }) => rest));
  }, [tasks]);

  const editTask = (item) => {
    setTask(item.text);
    setIsEditing(true);
    setCurrentTaskId(item.id);
  };

  const updateTask = () => {
    setTasks(
      tasks.map((item) =>
        item.id === currentTaskId ? { ...item, text: task } : item
      )
    );
    setTask("");
    setIsEditing(false);
    setCurrentTaskId(null);
  };

  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        fadeAnim: new Animated.Value(0), // Start from invisible
      };
      setTasks([...tasks, newTask]);
      setTask("");
      Animated.timing(newTask.fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find((item) => item.id === taskId);
    if (taskToDelete) {
      Animated.timing(taskToDelete.fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTasks(tasks.filter((item) => item.id !== taskId));
      });
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={isEditing ? updateTask : addTask}
        >
          <Text style={styles.addButtonText}>{isEditing ? "✓" : "+"}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View
            style={[styles.taskContainer, { opacity: item.fadeAnim }]}
          >
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
              <Text style={styles.checkbox}>
                {item.completed ? "✅" : "◻️"}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.taskText,
                item.completed && styles.completedTaskText,
              ]}
            >
              {item.text}
            </Text>
            <TouchableOpacity
              onPress={() => editTask(item)}
              style={styles.editButtonContainer}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteTask(item.id)}
              style={styles.deleteButtonContainer}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  completedTaskText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "#5C5CFF",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  checkbox: {
    fontSize: 20,
    marginRight: 10,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  editButtonContainer: {
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#5C5CFF",
    borderRadius: 5,
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
  },
  deleteButtonContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FF5C5C",
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
  },
});
