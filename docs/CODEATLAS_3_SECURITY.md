# CODEATLAS 3.0 SECURITY & SANDBOX EXECUTION SPECIFICATION

---

## 1. Safe Docker Sandbox Container Architecture

All untrusted agent code modifications, build commands, and test suite executions are isolated inside ephemeral Docker containers.

```
Agent Task Execution Request
            ↓
Provision Ephemeral Workspace Directory (/workspaces/{taskId})
            ↓
Launch Isolated Docker Sandbox Container
  - CPU Limit: 2.0 Cores
  - Memory Limit: 4.0 GB RAM
  - Network Policy: Restricted (No arbitrary outbound internet access)
  - Filesystem: Mount workspace volume as read/write, root filesystem read-only
  - Process Isolation: Non-root container user (`codeatlas` UID 10001)
  - Timeout Guard: Hard 10-minute container destruction limit
```

---

## 2. Security Threat Model & Protections

| Threat | Risk Level | Protection Mechanism |
| :--- | :--- | :--- |
| **Path Traversal Attacks** | **HIGH** | Strict canonical path validation (`Path.GetFullPath`) enforcing workspace root boundaries. |
| **Arbitrary Shell Execution** | **HIGH** | Command whitelist validation preventing dangerous binaries (`rm -rf /`, `curl | sh`, `chmod`). |
| **Secret & Credential Leakage**| **CRITICAL** | Automatic regex redaction (`API_KEY`, `PASSWORD`, `SECRET`, `BEARER`) before emitting logs or LLM context. |
| **Container Breakout** | **HIGH** | Seccomp profiles, non-root user execution, disabled root capabilities (`--cap-drop=ALL`). |
| **SSRF (Server-Side Request Forgery)** | **HIGH** | Local network IP filtering (`127.0.0.1`, `169.254.169.254`, private subnet blocking). |

---

## 3. Human Approval Gate Security Policies

High-risk actions require explicit human approval via the React UI modal:
1. `delete_file`: Deleting source files from workspace.
2. `modify_database_schema`: Applying SQL migrations to databases.
3. `push_to_remote`: Pushing code branches to external Git repositories.
4. `create_pull_request`: Opening GitHub / GitLab Pull Requests.
