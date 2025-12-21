#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zoho Mail API Sender für Python
Sendet E-Mails über die Zoho Mail REST API
"""

import requests
import json
import os
from typing import Dict, Optional

class ZohoMailSender:
    def __init__(self, client_id: str, client_secret: str, refresh_token: str, account_id: str = None):
        """
        Initialisiert den Zoho Mail Sender
        
        Args:
            client_id: Zoho OAuth Client ID
            client_secret: Zoho OAuth Client Secret
            refresh_token: Zoho OAuth Refresh Token
            account_id: Zoho Account ID (optional, wird automatisch ermittelt wenn nicht angegeben)
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.account_id = account_id or '6887007000000002002'  # Fallback
        self.access_token = None
        self.token_url = 'https://accounts.zoho.eu/oauth/v2/token'
        self.api_base_url = 'https://mail.zoho.eu/api'
    
    def get_access_token(self) -> str:
        """
        Ruft ein neues Access Token mit dem Refresh Token ab
        
        Returns:
            Access Token als String
        """
        try:
            response = requests.post(
                self.token_url,
                data={
                    'refresh_token': self.refresh_token,
                    'client_id': self.client_id,
                    'client_secret': self.client_secret,
                    'grant_type': 'refresh_token'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data.get('access_token')
                return self.access_token
            else:
                print(f"Fehler beim Abrufen des Access Tokens: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Exception beim Abrufen des Access Tokens: {str(e)}")
            return None
    
    def send_email(self, to: str, subject: str, html_body: str, 
                   from_email: str = 'jonathan.simon@camillo-industries.de',
                   from_name: str = 'Camillo Industries') -> bool:
        """
        Sendet eine E-Mail über die Zoho Mail API
        
        Args:
            to: Empfänger-E-Mail-Adresse
            subject: Betreff
            html_body: HTML-Inhalt der E-Mail
            from_email: Absender-E-Mail-Adresse (optional)
            from_name: Absender-Name (optional)
        
        Returns:
            True wenn erfolgreich, False bei Fehler
        """
        try:
            # Access Token abrufen
            access_token = self.get_access_token()
            if not access_token:
                print("Konnte kein Access Token abrufen")
                return False
            
            # E-Mail senden
            url = f"{self.api_base_url}/accounts/{self.account_id}/messages"
            headers = {
                'Authorization': f'Zoho-oauthtoken {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'fromAddress': from_email,
                'toAddress': to,
                'subject': subject,
                'content': html_body,
                'mailFormat': 'html'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code in [200, 201]:
                print(f"E-Mail erfolgreich gesendet an {to}")
                return True
            else:
                print(f"Fehler beim Senden der E-Mail: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception beim Senden der E-Mail: {str(e)}")
            return False
    
    def send_shipping_confirmation(self, name: str, email: str, street: str, 
                                  zip_code: str, city: str, color: str, quantity: int) -> bool:
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
        subject = "Versandbestätigung - Ihre Bestellung ist unterwegs"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50;">Versandbestätigung - Camillo Industries</h2>
                
                <p>Hallo {name},</p>
                
                <p>Ihre Bestellung wurde versendet und ist auf dem Weg zu Ihnen!</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Bestelldetails:</h3>
                    <p><strong>Farbe:</strong> {color}</p>
                    <p><strong>Menge:</strong> {quantity}</p>
                    <p><strong>Lieferadresse:</strong><br>
                    {street}<br>
                    {zip_code} {city}</p>
                </div>
                
                <p>Sie erhalten Ihre Bestellung in den nächsten Tagen.</p>
                
                <p>Bei Fragen können Sie uns jederzeit kontaktieren.</p>
                
                <p>Mit freundlichen Grüßen,<br>
                <strong>Camillo Industries</strong></p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(email, subject, html_body)

