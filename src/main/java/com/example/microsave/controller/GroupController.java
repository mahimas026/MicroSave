package com.example.microsave.controller;

import com.example.microsave.entity.Group;
import com.example.microsave.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Group> createGroup(
            @Valid @RequestBody Group group) {

        return new ResponseEntity<>(
                groupService.createGroup(group),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {

        return ResponseEntity.ok(
                groupService.getAllGroups()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                groupService.getGroupById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody Group group) {

        return ResponseEntity.ok(
                groupService.updateGroup(id, group)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGroup(
            @PathVariable Long id) {

        groupService.deleteGroup(id);

        return ResponseEntity.ok(
                "Group deleted successfully"
        );
    }
}