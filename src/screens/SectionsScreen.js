import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSections } from '../context/SectionContext';
import { Input, Button, ColorPicker } from '../components';
import { Colors } from '../constants/colors';
import { getColorByKey } from '../constants/sectionColors';

const SectionsScreen = ({ navigation }) => {
  const { sections, addSection, deleteSection, updateSection } = useSections();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');

  const openAddModal = () => {
    setEditingSection(null);
    setName('');
    setColor('indigo');
    setModalVisible(true);
  };

  const openEditModal = (section) => {
    setEditingSection(section);
    setName(section.name);
    setColor(section.color);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (name.trim()) {
      if (editingSection) {
        updateSection(editingSection._id, {
          name: name.trim(),
          color,
        });
      } else {
        addSection({
          name: name.trim(),
          color,
        });
      }
      setModalVisible(false);
    }
  };

  const handleDelete = (sectionId) => {
    deleteSection(sectionId);
  };

  const renderSection = ({ item }) => {
    const colorData = getColorByKey(item.color);
    return (
      <TouchableOpacity
        style={styles.sectionItem}
        onPress={() => openEditModal(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.colorIndicator, { backgroundColor: colorData.color }]} />
        <Text style={styles.sectionName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Files</Text>
        <Text style={styles.subtitle}>
          Organize your tasks into files
        </Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📁</Text>
          <Text style={styles.emptyText}>No files yet</Text>
          <Text style={styles.emptySubtext}>
            Create files to organize your tasks
          </Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSection ? 'Edit File' : 'New File'}
            </Text>

            <Input
              label="File Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Work, Personal, Groceries"
            />

            <ColorPicker
              label="Color"
              selected={color}
              onSelect={setColor}
            />

            <View style={styles.modalButtons}>
              <Button
                title={editingSection ? 'Save Changes' : 'Create File'}
                onPress={handleSave}
                disabled={!name.trim()}
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  sectionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: Colors.error,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: Colors.textLight,
    lineHeight: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  modalButtons: {
    marginTop: 8,
  },
  buttonSpacer: {
    height: 12,
  },
});

export default SectionsScreen;
