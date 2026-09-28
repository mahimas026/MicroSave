package com.example.microsave.service;

import com.example.microsave.entity.Group;
import com.example.microsave.repository.GroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {

    private final GroupRepository groupRepository;

    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public Group createGroup(Group group) {
        return groupRepository.save(group);
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public Group getGroupById(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public Group updateGroup(Long id, Group group) {

        Group existingGroup = getGroupById(id);

        existingGroup.setGroupName(group.getGroupName());

        return groupRepository.save(existingGroup);
    }

    public void deleteGroup(Long id) {

        Group group = getGroupById(id);

        groupRepository.delete(group);
    }
}