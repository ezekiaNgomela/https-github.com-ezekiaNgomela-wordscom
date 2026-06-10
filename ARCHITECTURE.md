# Wordscom Architecture Rules

## 1. Layering Model

The system is split into strict layers:

- apps/ → UI applications only
- services/ → business logic + APIs
- platform/ → orchestration/control plane
- packages/ → shared code (no side effects)
- infra/ → infrastructure only (Kubernetes, Terraform)
- deployments/ → GitOps manifests only

---

## 2. Dependency Rules (STRICT)

Allowed dependencies:

- apps → services → packages
- services → packages
- platform → services, packages
- deployments → infra (declarative only)

NOT allowed:

- apps → infra
- services → infra
- infra → any code layer
- packages → anything else

---

## 3. Hard Constraint Rule

If a module violates dependency rules:
👉 build must fail

---

## 4. Business Logic Rule

Business logic MUST live only in services/

Never inside:
- apps/
- infra/
- platform/

---

## 5. Infrastructure Rule

infra/ is fully declarative:

- no application imports
- no runtime dependencies
- no business logic

---

## 6. GitOps Rule

deployments/ contains ONLY:
- YAML manifests
- Helm/Kustomize configs
- environment overrides

No TypeScript, no logic.

---

## 7. Goal of Architecture

This system must remain:
- modular
- independently deployable
- horizontally scalable
