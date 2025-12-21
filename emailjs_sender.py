#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EmailJS REST API Helper für Python
Sendet E-Mails über die EmailJS REST API
"""

import requests
import json
from typing import Dict, Optional

class EmailJSSender:
    def __init__(self, public_key: str, service_id: str):
        """
        Initialisiert den EmailJS Sender
        
        Args:
            public_key: EmailJS Public Key
            service_id: EmailJS Service ID
        """
        self.public_key = public_key
        self.service_id = service_id
        self.api_url = "https://api.emailjs.com/api/v1.0/email/send"
    
    def send_email(self, template_id: str, template_params: Dict, user_id: Optional[str] = None) -> bool:
        """
        Sendet eine E-Mail über EmailJS
        
        Args:
            template_id: ID des EmailJS Templates
            template_params: Dictionary mit Template-Parametern
            user_id: Optional - User ID (falls abweichend von public_key)
        
        Returns:
            True wenn erfolgreich, False bei Fehler
        """
        try:
            payload = {
                "service_id": self.service_id,
                "template_id": template_id,
                "user_id": user_id or self.public_key,
                "template_params": template_params
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print(f"E-Mail erfolgreich gesendet (Template: {template_id})")
                return True
            else:
                print(f"Fehler beim Senden der E-Mail: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception beim Senden der E-Mail: {str(e)}")
            return False
    
    def send_shipping_confirmation(self, name: str, email: str, street: str, zip_code: str, 
                                  city: str, color: str, quantity: int) -> bool:
        """
        Sendet Versandbestätigung an Kunden
        
        Args:
            name: Name des Kunden
            email: E-Mail-Adresse des Kunden
            street: Straße
            zip_code: Postleitzahl
            city: Stadt
            color: Farbe des Produkts
            quantity: Anzahl
        
        Returns:
            True wenn erfolgreich
        """
        template_params = {
            "name": name,
            "customer_email": email,
            "street": street,
            "zip": zip_code,
            "city": city,
            "color": color,
            "quantity": str(quantity)
        }
        
        return self.send_email("shipping_confirmation_customer", template_params)

