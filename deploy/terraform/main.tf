# -------------------------------------------------
# Phase 20: Terraform Bootstrap (Production Cloud)
# Hyperscale Platform Infrastructure Layer
# -------------------------------------------------

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# -----------------------------
# Provider
# -----------------------------

provider "aws" {
  region = var.region
}

# -----------------------------
# Networking (VPC)
# -----------------------------

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "wordscom-vpc"
  cidr = "10.0.0.0/16"

  azs             = var.azs
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

# -----------------------------
# Kubernetes Cluster (EKS placeholder)
# -----------------------------

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.0.0"

  cluster_name    = "wordscom-cluster"
  cluster_version = "1.29"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    main = {
      desired_size = 3
      max_size     = 10
      min_size     = 2

      instance_types = ["t3.medium"]
    }
  }
}

# -----------------------------
# Redis (logical placeholder)
# -----------------------------

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "wordscom-redis"
  engine              = "redis"
  node_type           = "cache.t3.micro"
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  port                = 6379
}

# -----------------------------
# NATS (deployment placeholder)
# -----------------------------

resource "aws_instance" "nats" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type = "t3.micro"

  tags = {
    Name = "wordscom-nats"
  }
}

# -----------------------------
# Outputs
# -----------------------------

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
