terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "Deployment"
    storage_account_name = "yourdoctfstate"
    container_name       = "tfstate"
    key                  = "yourdoc.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Create Resource Group
resource "azurerm_resource_group" "yourdoc-rg" {
  name     = "azure-deploy-rg"
  location = "Canada East"
}

# Create App Service Plan
resource "azurerm_service_plan" "yourdoc-asp" {
  name                = "yourdoc-asp"
  resource_group_name = azurerm_resource_group.yourdoc-rg.name
  location            = azurerm_resource_group.yourdoc-rg.location
  os_type             = "Linux"
  sku_name            = "F1"
}

# Create App Service
resource "azurerm_linux_web_app" "yourdoc-ap" {
  name                = "yourdoc-ap"
  resource_group_name = azurerm_resource_group.yourdoc-rg.name
  location            = azurerm_resource_group.yourdoc-rg.location
  service_plan_id     = azurerm_service_plan.yourdoc-asp.id

  site_config {
    application_stack {
      node_version = "22-lts"
    }
    always_on = false
  }
}