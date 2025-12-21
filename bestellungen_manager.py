#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bestellungen Manager für Camillo Industries
Verwaltet Bestellungen aus der Supabase-Datenbank
"""

import tkinter as tk
from tkinter import ttk, messagebox, font
from supabase import create_client, Client
import time
import threading
from datetime import datetime
from typing import List, Dict, Optional
from collections import Counter
from zoho_mail_sender import ZohoMailSender

class BestellungenManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Camillo Industries - Bestellungen Manager")
        self.root.geometry("1600x900")
        
        # Theme (True = Dark Mode, False = Light Mode)
        self.dark_mode = False
        
        # Farben für die Eiskratzer
        self.color_map = {
            'weiß': '#FFFFFF',
            'schwarz': '#000000',
            'orange': '#FF8C00',
            'blau': '#0066CC',
            'gelb': '#FFD700',
            'grau': '#808080',
            'grün': '#00AA00',
            'pink': '#FF69B4',
            'rot': '#FF0000'
        }
        
        # Supabase Client initialisieren
        self.supabase: Optional[Client] = None
        self.init_supabase()
        
        # Zoho Mail Sender initialisieren
        self.zoho_sender: Optional[ZohoMailSender] = None
        self.init_zoho_mail()
        
        # Refresh-Thread
        self.refresh_thread = None
        self.running = False
        
        # GUI erstellen
        self.setup_themes()
        self.create_gui()
        
        # Theme initial anwenden
        self.apply_theme()
        
        # Initiale Daten laden
        self.refresh_data()
        
        # Auto-Refresh starten
        self.start_auto_refresh()
    
    def setup_themes(self):
        """Definiert die Themes"""
        self.themes = {
            'light': {
                'bg': '#F5F5F5',
                'fg': '#000000',
                'frame_bg': '#FFFFFF',
                'button_bg': '#E0E0E0',
                'button_fg': '#000000',
                'tree_bg': '#FFFFFF',
                'tree_fg': '#000000',
                'tree_select': '#0078D4',
                'title_fg': '#000000',
                'status_bg': '#E0E0E0',
                'status_fg': '#000000',
                'label_bg': '#FFFFFF',
                'label_fg': '#000000'
            },
            'dark': {
                'bg': '#1E1E1E',
                'fg': '#FFFFFF',
                'frame_bg': '#2D2D2D',
                'button_bg': '#3E3E3E',
                'button_fg': '#FFFFFF',
                'tree_bg': '#252526',
                'tree_fg': '#CCCCCC',
                'tree_select': '#007ACC',
                'title_fg': '#FFFFFF',
                'status_bg': '#3E3E3E',
                'status_fg': '#FFFFFF',
                'label_bg': '#2D2D2D',
                'label_fg': '#FFFFFF'
            }
        }
    
    def get_theme(self):
        """Gibt das aktuelle Theme zurück"""
        return self.themes['dark'] if self.dark_mode else self.themes['light']
    
    def init_supabase(self):
        """Initialisiert die Supabase-Verbindung"""
        try:
            SUPABASE_URL = 'https://tqeepddjmgdzdwndyeoj.supabase.co'
            SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZWVwZGRqbWdkemR3bmR5ZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjc0NDUsImV4cCI6MjA4MTY0MzQ0NX0.CodFoJkvyIaC0TAWe-6BvuuD-G5GWm1R99E6d0qJsQU'
            
            self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("Supabase Client erfolgreich initialisiert")
        except Exception as e:
            messagebox.showerror("Fehler", f"Supabase-Verbindung fehlgeschlagen:\n{str(e)}")
            print(f"Supabase Fehler: {e}")
    
    def init_zoho_mail(self):
        """Initialisiert Zoho Mail Sender"""
        try:
            # TODO: Ersetzen Sie diese Werte mit Ihren Zoho OAuth-Anmeldedaten
            # Sie finden diese in der Zoho Developer Console:
            # - Client ID: Developer Console → Ihre App → Client ID
            # - Client Secret: Developer Console → Ihre App → Client Secret
            # - Refresh Token: Nach OAuth-Authentifizierung erhalten
            ZOHO_CLIENT_ID = 'YOUR_ZOHO_CLIENT_ID'
            ZOHO_CLIENT_SECRET = 'YOUR_ZOHO_CLIENT_SECRET'
            ZOHO_REFRESH_TOKEN = 'YOUR_ZOHO_REFRESH_TOKEN'
            ZOHO_ACCOUNT_ID = '6887007000000002002'  # Optional, wird automatisch ermittelt
            
            if (ZOHO_CLIENT_ID != 'YOUR_ZOHO_CLIENT_ID' and 
                ZOHO_CLIENT_SECRET != 'YOUR_ZOHO_CLIENT_SECRET' and 
                ZOHO_REFRESH_TOKEN != 'YOUR_ZOHO_REFRESH_TOKEN'):
                self.zoho_sender = ZohoMailSender(
                    ZOHO_CLIENT_ID, 
                    ZOHO_CLIENT_SECRET, 
                    ZOHO_REFRESH_TOKEN,
                    ZOHO_ACCOUNT_ID
                )
                print("Zoho Mail Sender erfolgreich initialisiert")
            else:
                print("Zoho Mail nicht konfiguriert - E-Mails werden nicht gesendet")
        except Exception as e:
            print(f"Zoho Mail Fehler: {e}")
            # Zoho Mail-Fehler sollen das Programm nicht blockieren
    
    def toggle_theme(self):
        """Wechselt zwischen Dark und Light Mode"""
        self.dark_mode = not self.dark_mode
        self.apply_theme()
        # refresh_data wird in apply_theme nicht mehr aufgerufen, da es doppelt wäre
        # Stattdessen rufen wir es hier auf
        if hasattr(self, 'open_tree'):  # Prüfe ob GUI bereits erstellt wurde
            self.refresh_data()
    
    def apply_theme(self):
        """Wendet das aktuelle Theme an"""
        theme = self.get_theme()
        self.root.configure(bg=theme['bg'])
        # Aktualisiere alle Widgets mit dem neuen Theme
        # Da Tkinter ttk.Style verwendet, müssen wir den Style setzen
        style = ttk.Style()
        style.theme_use('clam')  # Basis-Theme
        
        # Konfiguriere Style für verschiedene Widgets
        style.configure('TFrame', background=theme['frame_bg'])
        style.configure('TLabel', background=theme['label_bg'], foreground=theme['label_fg'])
        style.configure('TLabelFrame', background=theme['frame_bg'], foreground=theme['fg'])
        style.configure('TLabelFrame.Label', background=theme['frame_bg'], foreground=theme['fg'])
        style.configure('TButton', background=theme['button_bg'], foreground=theme['button_fg'])
        style.map('TButton', background=[('active', theme['button_bg'])])
        style.configure('Treeview', background=theme['tree_bg'], foreground=theme['tree_fg'],
                       fieldbackground=theme['tree_bg'])
        style.map('Treeview', background=[('selected', theme['tree_select'])])
        style.configure('Treeview.Heading', background=theme['button_bg'], foreground=theme['button_fg'])
        
        # Statusbar (wenn bereits erstellt)
        if hasattr(self, 'status_label'):
            self.status_label.configure(background=theme['status_bg'], foreground=theme['status_fg'])
        
        # Theme-Button Text aktualisieren (wenn bereits erstellt)
        if hasattr(self, 'theme_btn'):
            theme_text = "🌙 Dark Mode" if not self.dark_mode else "☀️ Light Mode"
            self.theme_btn.configure(text=theme_text)
    
    def create_gui(self):
        """Erstellt die GUI-Elemente"""
        theme = self.get_theme()
        self.root.configure(bg=theme['bg'])
        
        # Hauptcontainer
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Grid-Konfiguration
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Header mit Titel und Theme-Toggle
        header_frame = ttk.Frame(main_frame)
        header_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        header_frame.columnconfigure(0, weight=1)
        
        theme = self.get_theme()
        title_label = ttk.Label(header_frame, text="Bestellungen Manager", 
                               font=("Arial", 18, "bold"))
        title_label.grid(row=0, column=0, sticky=tk.W)
        
        theme_text = "🌙 Dark Mode" if not self.dark_mode else "☀️ Light Mode"
        self.theme_btn = ttk.Button(header_frame, text=theme_text, command=self.toggle_theme)
        self.theme_btn.grid(row=0, column=1, sticky=tk.E, padx=(10, 0))
        
        # Statistik-Frame (Farbstatistik)
        stats_frame = ttk.LabelFrame(main_frame, text="Offene Bestellungen nach Farbe", padding="10")
        stats_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        self.stats_container = ttk.Frame(stats_frame)
        self.stats_container.pack(fill=tk.X)
        self.stats_labels = {}
        
        # Linke Seite: Offene Bestellungen
        left_frame = ttk.LabelFrame(main_frame, text="Offene Bestellungen (Nicht versendet)", padding="10")
        left_frame.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))
        left_frame.columnconfigure(0, weight=1)
        left_frame.rowconfigure(1, weight=1)
        
        # Scrollbars für linke Liste
        left_v_scrollbar = ttk.Scrollbar(left_frame, orient="vertical")
        left_h_scrollbar = ttk.Scrollbar(left_frame, orient="horizontal")
        left_v_scrollbar.grid(row=1, column=1, sticky=(tk.N, tk.S))
        left_h_scrollbar.grid(row=2, column=0, sticky=(tk.W, tk.E))
        
        # Treeview für offene Bestellungen
        self.open_tree = ttk.Treeview(
            left_frame,
            columns=("id", "name", "email", "street", "zip", "city", "color", "quantity", "total_price", "created_at", "versendet"),
            show="headings",
            yscrollcommand=left_v_scrollbar.set,
            xscrollcommand=left_h_scrollbar.set,
            selectmode="browse"
        )
        left_v_scrollbar.config(command=self.open_tree.yview)
        left_h_scrollbar.config(command=self.open_tree.xview)
        
        # Spalten konfigurieren
        columns_config = [
            ("id", "ID", 80),
            ("name", "Name", 150),
            ("email", "E-Mail", 200),
            ("street", "Straße", 200),
            ("zip", "PLZ", 80),
            ("city", "Ort", 150),
            ("color", "Farbe", 120),
            ("quantity", "Menge", 80),
            ("total_price", "Gesamtpreis", 120),
            ("created_at", "Erstellt am", 150),
            ("versendet", "Versendet", 80)
        ]
        
        for col, heading, width in columns_config:
            self.open_tree.heading(col, text=heading)
            self.open_tree.column(col, width=width, anchor=tk.CENTER if col in ['quantity', 'total_price', 'zip'] else tk.W)
        
        # Event-Handler für Klick auf Zeile (einfacher Klick zeigt Adresse)
        self.open_tree.bind('<Button-1>', self.show_address_popup)
        
        self.open_tree.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Button: Als versendet markieren
        mark_sent_btn = ttk.Button(left_frame, text="Als versendet markieren", command=self.mark_as_sent)
        mark_sent_btn.grid(row=3, column=0, pady=(10, 0))
        
        # Rechte Seite: Archiv
        right_frame = ttk.LabelFrame(main_frame, text="Archiv (Versendet)", padding="10")
        right_frame.grid(row=2, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(5, 0))
        right_frame.columnconfigure(0, weight=1)
        right_frame.rowconfigure(2, weight=1)
        
        # Summe der Mengen und Gesamtpreise
        self.sum_label = ttk.Label(right_frame, text="Gesamtmenge: 0 | Gesamtpreis: 0,00 €", font=("Arial", 12, "bold"))
        self.sum_label.grid(row=0, column=0, pady=(0, 10))
        
        # Scrollbars für rechte Liste
        right_v_scrollbar = ttk.Scrollbar(right_frame, orient="vertical")
        right_h_scrollbar = ttk.Scrollbar(right_frame, orient="horizontal")
        right_v_scrollbar.grid(row=2, column=1, sticky=(tk.N, tk.S))
        right_h_scrollbar.grid(row=3, column=0, sticky=(tk.W, tk.E))
        
        # Treeview für archivierte Bestellungen
        self.archive_tree = ttk.Treeview(
            right_frame,
            columns=("id", "name", "email", "street", "zip", "city", "color", "quantity", "total_price", "created_at", "versendet"),
            show="headings",
            yscrollcommand=right_v_scrollbar.set,
            xscrollcommand=right_h_scrollbar.set,
            selectmode="browse"
        )
        right_v_scrollbar.config(command=self.archive_tree.yview)
        right_h_scrollbar.config(command=self.archive_tree.xview)
        
        # Spalten konfigurieren (gleich wie oben)
        for col, heading, width in columns_config:
            self.archive_tree.heading(col, text=heading)
            self.archive_tree.column(col, width=width, anchor=tk.CENTER if col in ['quantity', 'total_price', 'zip'] else tk.W)
        
        self.archive_tree.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Button: Eintrag löschen
        delete_btn = ttk.Button(right_frame, text="Ausgewählten Eintrag löschen", command=self.delete_entry)
        delete_btn.grid(row=4, column=0, pady=(10, 0))
        
        # Statusbar
        self.status_label = ttk.Label(main_frame, text="Bereit", relief=tk.SUNKEN)
        self.status_label.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(10, 0))
        
        # Button: Manuell aktualisieren
        refresh_btn = ttk.Button(main_frame, text="🔄 Aktualisieren", command=self.refresh_data)
        refresh_btn.grid(row=4, column=0, columnspan=2, pady=(10, 0))
    
    def get_bestellungen(self) -> List[Dict]:
        """Lädt alle Bestellungen aus der Datenbank"""
        try:
            response = self.supabase.table("bestellungen").select("*").order("created_at", desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            self.update_status(f"Fehler beim Laden: {str(e)}")
            print(f"Fehler beim Laden: {e}")
            return []
    
    def update_color_statistics(self, bestellungen: List[Dict]):
        """Aktualisiert die Farbstatistik"""
        # Lösche alte Labels
        for widget in self.stats_container.winfo_children():
            widget.destroy()
        self.stats_labels.clear()
        
        # Zähle offene Bestellungen pro Farbe
        color_counts = Counter()
        for bestellung in bestellungen:
            if not bestellung.get('versendet', False):
                color = bestellung.get('color', 'unbekannt')
                quantity = bestellung.get('quantity', 0)
                color_counts[color] += int(quantity) if quantity else 1
        
        # Erstelle Labels für jede Farbe
        for color_name, count in sorted(color_counts.items()):
            color_hex = self.color_map.get(color_name.lower(), '#CCCCCC')
            
            # Frame für diese Farbe
            color_frame = ttk.Frame(self.stats_container)
            color_frame.pack(side=tk.LEFT, padx=5, pady=5)
            
            # Farbkreis
            color_canvas = tk.Canvas(color_frame, width=30, height=30, highlightthickness=0)
            color_canvas.pack(side=tk.LEFT, padx=(0, 5))
            color_canvas.create_oval(5, 5, 25, 25, fill=color_hex, outline='black' if not self.dark_mode else 'white')
            
            # Label mit Anzahl (klickbar)
            label_text = f"{color_name.capitalize()}: {count}"
            label = ttk.Label(color_frame, text=label_text, cursor="hand2",
                            font=("Arial", 10, "bold"))
            label.pack(side=tk.LEFT)
            label.bind("<Button-1>", lambda e, c=color_name: self.focus_oldest_by_color(c))
            self.stats_labels[color_name] = label
        
        if not color_counts:
            ttk.Label(self.stats_container, text="Keine offenen Bestellungen").pack()
    
    def focus_oldest_by_color(self, color: str):
        """Fokussiert die älteste Bestellung der angegebenen Farbe"""
        # Finde alle offenen Bestellungen dieser Farbe
        bestellungen = self.get_bestellungen()
        matching_bestellungen = [
            b for b in bestellungen 
            if not b.get('versendet', False) and b.get('color', '').lower() == color.lower()
        ]
        
        if not matching_bestellungen:
            messagebox.showinfo("Info", f"Keine offenen Bestellungen für Farbe '{color}' gefunden.")
            return
        
        # Finde die älteste (kleinste created_at)
        oldest = min(matching_bestellungen, key=lambda x: x.get('created_at', ''))
        oldest_id = str(oldest.get('id', ''))
        
        # Finde die entsprechende Zeile im Treeview
        # Die iid ist die vollständige UUID
        try:
            # Versuche direkt die iid zu verwenden
            self.open_tree.selection_set(oldest_id)
            self.open_tree.focus(oldest_id)
            self.open_tree.see(oldest_id)
            self.update_status(f"Älteste Bestellung für Farbe '{color}' fokussiert")
        except:
            # Fallback: Durchsuche alle Items
            for item in self.open_tree.get_children():
                if str(item) == oldest_id:
                    self.open_tree.selection_set(item)
                    self.open_tree.focus(item)
                    self.open_tree.see(item)
                    self.update_status(f"Älteste Bestellung für Farbe '{color}' fokussiert")
                    return
    
    def refresh_data(self):
        """Aktualisiert die Anzeige der Bestellungen"""
        if not self.supabase:
            return
        
        # Bestehende Einträge löschen
        for item in self.open_tree.get_children():
            self.open_tree.delete(item)
        for item in self.archive_tree.get_children():
            self.archive_tree.delete(item)
        
        # Daten laden
        bestellungen = self.get_bestellungen()
        
        # Farbstatistik aktualisieren
        self.update_color_statistics(bestellungen)
        
        total_quantity = 0
        total_price_sum = 0.0
        open_count = 0
        archive_count = 0
        
        theme = self.get_theme()
        
        for bestellung in bestellungen:
            # Daten formatieren
            created_at = bestellung.get('created_at', '')
            if created_at:
                try:
                    dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    created_at = dt.strftime('%d.%m.%Y %H:%M')
                except:
                    pass
            
            total_price = bestellung.get('total_price', 0)
            if isinstance(total_price, (int, float)):
                total_price_str = f"{total_price:.2f} €"
            else:
                total_price_str = str(total_price)
            
            quantity = bestellung.get('quantity', 0)
            versendet = bestellung.get('versendet', False)
            color = bestellung.get('color', '')
            bestellung_id = str(bestellung.get('id', ''))
            
            # Daten in Treeview einfügen
            id_display = bestellung_id[:8] + '...' if len(bestellung_id) > 8 else bestellung_id
            # Color mit visuellem Indikator
            color_display = f"● {color.capitalize()}"
            values = (
                id_display,
                bestellung.get('name', ''),
                bestellung.get('email', ''),
                bestellung.get('street', ''),
                bestellung.get('zip', ''),
                bestellung.get('city', ''),
                color_display,
                quantity,
                total_price_str,
                created_at,
                'Ja' if versendet else 'Nein'
            )
            
            # Farbe für die Color-Spalte (Tag für Farbstyling)
            color_hex = self.color_map.get(color.lower(), '#CCCCCC')
            color_tag = f"color_{color.lower()}"
            
            if versendet:
                # In Archiv (grün)
                item = self.archive_tree.insert('', 'end', values=values, tags=('sent', color_tag), 
                                               iid=bestellung_id)
                total_quantity += int(quantity) if quantity else 0
                # Gesamtpreis zur Summe hinzufügen
                price_value = bestellung.get('total_price', 0)
                if isinstance(price_value, (int, float)):
                    total_price_sum += float(price_value)
                elif isinstance(price_value, str):
                    try:
                        total_price_sum += float(price_value.replace('€', '').replace(',', '.').strip())
                    except:
                        pass
                archive_count += 1
            else:
                # In offene Bestellungen (rot, ganz oben)
                item = self.open_tree.insert('', 0, values=values, tags=('pending', color_tag),
                                           iid=bestellung_id)
                open_count += 1
        
        # Tags konfigurieren
        self.open_tree.tag_configure('pending', background='#ffcccc' if not self.dark_mode else '#4a2a2a')
        self.archive_tree.tag_configure('sent', background='#ccffcc' if not self.dark_mode else '#2a4a2a')
        
        # Farb-Tags für Color-Spalte konfigurieren (Textfarbe setzen)
        for color_name, color_hex in self.color_map.items():
            tag = f"color_{color_name.lower()}"
            # Für sehr dunkle Farben verwenden wir helle Textfarbe
            if color_name.lower() in ['schwarz', 'blau', 'grau']:
                text_color = '#FFFFFF' if not self.dark_mode else '#CCCCCC'
            else:
                text_color = color_hex
            # Treeview unterstützt keine individuellen Zellfarben, daher nur Tag-Styling
            # Die Farbe wird bereits im Text als ● Symbol dargestellt
        
        # Summe aktualisieren
        self.sum_label.config(text=f"Gesamtmenge (Archiv): {total_quantity} | Gesamtpreis: {total_price_sum:.2f} €")
        
        # Status aktualisieren
        self.update_status(f"Aktualisiert: {open_count} offene, {archive_count} versendete Bestellungen")
    
    def get_color_display(self, color: str) -> str:
        """Gibt die Farbe mit visueller Darstellung zurück"""
        color_hex = self.color_map.get(color.lower(), '#CCCCCC')
        # Unicode-Farbkreis
        return f"● {color.capitalize()}"
    
    def show_address_popup(self, event):
        """Zeigt ein Popup mit der Adresse der ausgewählten Zeile"""
        selection = self.open_tree.selection()
        if not selection:
            return
        
        bestellung_id = selection[0]
        item = self.open_tree.item(bestellung_id)
        values = item['values']
        
        # Adressdaten extrahieren
        if len(values) >= 6:
            name = values[1]
            email = values[2]
            street = values[3]
            zip_code = values[4]
            city = values[5]
            
            # Popup-Fenster erstellen
            popup = tk.Toplevel(self.root)
            popup.title("Adresse")
            popup.geometry("400x250")
            popup.transient(self.root)
            popup.grab_set()
            
            # Theme anwenden
            theme = self.get_theme()
            popup.configure(bg=theme['bg'])
            
            # Frame für Inhalt
            content_frame = ttk.Frame(popup, padding="20")
            content_frame.pack(fill=tk.BOTH, expand=True)
            
            # Titel
            title_label = ttk.Label(content_frame, text="Adresse", font=("Arial", 14, "bold"))
            title_label.pack(pady=(0, 15))
            
            # Name
            name_label = ttk.Label(content_frame, text=f"Name: {name}", font=("Arial", 10))
            name_label.pack(anchor=tk.W, pady=2)
            
            # E-Mail
            email_label = ttk.Label(content_frame, text=f"E-Mail: {email}", font=("Arial", 10))
            email_label.pack(anchor=tk.W, pady=2)
            
            # Separator
            ttk.Separator(content_frame, orient='horizontal').pack(fill=tk.X, pady=10)
            
            # Adresse
            address_label = ttk.Label(content_frame, text="Adresse:", font=("Arial", 10, "bold"))
            address_label.pack(anchor=tk.W, pady=(5, 2))
            
            street_label = ttk.Label(content_frame, text=f"Straße: {street}", font=("Arial", 10))
            street_label.pack(anchor=tk.W, pady=2)
            
            zip_label = ttk.Label(content_frame, text=f"PLZ: {zip_code}", font=("Arial", 10))
            zip_label.pack(anchor=tk.W, pady=2)
            
            city_label = ttk.Label(content_frame, text=f"Ort: {city}", font=("Arial", 10))
            city_label.pack(anchor=tk.W, pady=2)
            
            # Vollständige Adresse
            full_address = f"{street}, {zip_code} {city}"
            full_address_label = ttk.Label(content_frame, text=f"Vollständig: {full_address}", 
                                          font=("Arial", 10, "bold"))
            full_address_label.pack(anchor=tk.W, pady=(10, 0))
            
            # Schließen-Button
            close_btn = ttk.Button(content_frame, text="Schließen", command=popup.destroy)
            close_btn.pack(pady=(15, 0))
            
            # Zentrieren des Popups
            popup.update_idletasks()
            x = (popup.winfo_screenwidth() // 2) - (popup.winfo_width() // 2)
            y = (popup.winfo_screenheight() // 2) - (popup.winfo_height() // 2)
            popup.geometry(f"+{x}+{y}")
        else:
            messagebox.showwarning("Fehler", "Adressdaten konnten nicht geladen werden.")
    
    def mark_as_sent(self):
        """Markiert die ausgewählte Bestellung als versendet"""
        selection = self.open_tree.selection()
        if not selection:
            messagebox.showwarning("Keine Auswahl", "Bitte wählen Sie eine Bestellung aus.")
            return
        
        bestellung_id = selection[0]
        item = self.open_tree.item(bestellung_id)
        values = item['values']
        
        # Bestätigung mit vollständiger Adresse
        adresse = f"{values[3]}, {values[4]} {values[5]}" if len(values) > 5 else ""
        if not messagebox.askyesno("Bestätigung", f"Bestellung wirklich als versendet markieren?\n\nName: {values[1]}\nE-Mail: {values[2]}\nAdresse: {adresse}"):
            return
        
        try:
            # Bestellung in Supabase als versendet markieren
            response = self.supabase.table("bestellungen").update({
                "versendet": True
            }).eq("id", bestellung_id).execute()
            
            if response.data:
                # Versandbestätigungs-E-Mail an Kunden senden
                if self.zoho_sender and response.data:
                    bestellung = response.data[0]
                    try:
                        self.zoho_sender.send_shipping_confirmation(
                            name=bestellung.get('name', ''),
                            email=bestellung.get('email', ''),
                            street=bestellung.get('street', ''),
                            zip_code=bestellung.get('zip', ''),
                            city=bestellung.get('city', ''),
                            color=bestellung.get('color', ''),
                            quantity=bestellung.get('quantity', 0)
                        )
                        self.update_status("Bestellung als versendet markiert und E-Mail gesendet")
                    except Exception as email_error:
                        print(f"E-Mail Fehler: {email_error}")
                        self.update_status("Bestellung als versendet markiert (E-Mail konnte nicht gesendet werden)")
                else:
                    self.update_status("Bestellung als versendet markiert")
                
                self.refresh_data()
                messagebox.showinfo("Erfolg", "Bestellung wurde als versendet markiert.")
            else:
                messagebox.showerror("Fehler", "Bestellung konnte nicht aktualisiert werden.")
        except Exception as e:
            messagebox.showerror("Fehler", f"Fehler beim Aktualisieren:\n{str(e)}")
            print(f"Update Fehler: {e}")
    
    def delete_entry(self):
        """Löscht einen archivierten Eintrag"""
        selection = self.archive_tree.selection()
        if not selection:
            messagebox.showwarning("Keine Auswahl", "Bitte wählen Sie einen Eintrag zum Löschen aus.")
            return
        
        bestellung_id = selection[0]
        item = self.archive_tree.item(bestellung_id)
        values = item['values']
        
        # Bestätigung mit vollständiger Adresse
        adresse = f"{values[3]}, {values[4]} {values[5]}" if len(values) > 5 else ""
        if not messagebox.askyesno("Löschen bestätigen", 
                                  f"Bestellung wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!\n\nName: {values[1]}\nE-Mail: {values[2]}\nAdresse: {adresse}"):
            return
        
        try:
            response = self.supabase.table("bestellungen").delete().eq("id", bestellung_id).execute()
            self.update_status("Bestellung gelöscht")
            self.refresh_data()
            messagebox.showinfo("Erfolg", "Bestellung wurde gelöscht.")
        except Exception as e:
            messagebox.showerror("Fehler", f"Fehler beim Löschen:\n{str(e)}")
            print(f"Delete Fehler: {e}")
    
    def update_status(self, message: str):
        """Aktualisiert die Statusleiste"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        self.status_label.config(text=f"[{timestamp}] {message}")
    
    def auto_refresh_loop(self):
        """Automatisches Aktualisieren alle 30 Sekunden"""
        while self.running:
            time.sleep(30)
            if self.running:
                try:
                    self.root.after(0, self.refresh_data)
                except:
                    pass
    
    def start_auto_refresh(self):
        """Startet den Auto-Refresh Thread"""
        self.running = True
        self.refresh_thread = threading.Thread(target=self.auto_refresh_loop, daemon=True)
        self.refresh_thread.start()
        self.update_status("Auto-Refresh aktiviert (alle 30 Sekunden)")
    
    def on_closing(self):
        """Wird beim Schließen des Fensters aufgerufen"""
        self.running = False
        self.root.destroy()

def main():
    root = tk.Tk()
    app = BestellungenManager(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
