package com.example.microsave.controller;

import com.example.microsave.entity.Group;
import com.example.microsave.service.GroupService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public Group createGroup(@RequestBody Group group) {
        return groupService.createGroup(group);
    }

    @GetMapping
    public List<Group> getAllGroups() {
        return groupService.getAllGroups();
    }

    @GetMapping("/{id}")
    public Group getGroupById(@PathVariable Long id) {
        return groupService.getGroupById(id);
    }

    @PutMapping("/{id}")
    public Group updateGroup(
            @PathVariable Long id,
            @RequestBody Group group) {

        return groupService.updateGroup(id, group);
    }

    @DeleteMapping("/{id}")
    public String deleteGroup(@PathVariable Long id) {

        groupService.deleteGroup(id);

        return "Group deleted successfully";
    }
}