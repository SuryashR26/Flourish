"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
 FaHandshake,
  FaTimes,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import { getSettings, updateSettings } from "@/api/apiClient";
import PasswordChangeModal from "./PasswordChangeModal";
import { advancedSkills } from "../../app/types/projectCategory";
import { FaX } from "react-icons/fa6";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/ui/NotificationContainer";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSettings {
  email: string;
  display_name: string;
  bio: string;
  areas_of_interest: string[];
  profile_visibility: "public" | "private";
  show_email_publicly: boolean;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose }) => {
  const [activePanel, setActivePanel] = useState("profile");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [editedInterests, setEditedInterests] = useState<string[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private"
  >("public");
  const [showEmailPublicly, setShowEmailPublicly] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter available interests based on search and exclude already selected
  const filteredInterests = advancedSkills
    .map((skill) => skill.label)
    .filter(
      (interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedInterests.includes(interest)
    );

  const addInterest = (interest: string) => {
    if (!selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => [...prev, interest]);
      setEditedInterests((prev) => [...prev, interest]);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    setSearchQuery("");
  };

  // Focus search input when it becomes visible
  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current
          .closest(".search-container")
          ?.contains(event.target as Node)
      ) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };

    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSearch]);

  // Fetch settings data when component opens
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isOpen) return;

      try {
        const response = await getSettings();
        if (response.success) {
          const userSettings = response.settings;
          setSettings(userSettings);
          setDisplayName(userSettings.display_name || "");
          setBio(userSettings.bio || "");
          setSelectedInterests(userSettings.areas_of_interest || []);
          setEditedInterests(userSettings.areas_of_interest || []);
          setProfileVisibility(userSettings.profile_visibility || "public");
          setShowEmailPublicly(userSettings.show_email_publicly || false);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
      }
    };

    fetchSettings();
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const switchPanel = (panelName: string) => {
    setActivePanel(panelName);
  };

  const toggleSwitch = (element: HTMLElement) => {
    element.classList.toggle("active");
  };

  const toggleInterest = (interest: string) => {
    setEditedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const settingsData = {
        display_name: displayName,
        bio: bio,
        areas_of_interest: editedInterests,
        profile_visibility: profileVisibility,
        show_email_publicly: showEmailPublicly,
      };

      const response = await updateSettings(settingsData);
      if (response.success) {
        console.log("Settings saved successfully");
        showSuccessNotification("Success", "Settings saved successfully!");
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showErrorNotification(
        "Error",
        "Failed to save settings"
      );
      // You could add error handling/notification here
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="settings-overlay active"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="settings-popup">
        {/* Main content wrapper */}
        <div className="settings-main-content">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <div className="settings-close" onClick={onClose}>
              <FaTimes />
            </div>

            {/* <div
              className={`settings-nav-item ${activePanel === 'general' ? 'active' : ''}`}
              onClick={() => switchPanel('general')}
            >
              <span className="settings-nav-icon"><FaCog /></span>
              <span>General</span>
            </div> */}

            <div
              className={`settings-nav-item ${
                activePanel === "profile" ? "active" : ""
              }`}
              onClick={() => switchPanel("profile")}
            >
              <span className="settings-nav-icon">
                <FaUser />
              </span>
              <span>Profile & Interests</span>
            </div>

            {/* <div 
            className={`settings-nav-item ${activePanel === 'projects' ? 'active' : ''}`} 
            onClick={() => switchPanel('projects')}
          >
            <span className="settings-nav-icon"><FaFolder /></span>
            <span>Project Preferences</span>
          </div> */}

            <div
              className={`settings-nav-item ${
                activePanel === "collaboration" ? "active" : ""
              }`}
              onClick={() => switchPanel("collaboration")}
            >
              <span className="settings-nav-icon">
                <FaHandshake />
              </span>
              <span>Collaboration</span>
            </div>

            {/* <div
              className={`settings-nav-item ${activePanel === 'notifications' ? 'active' : ''}`}
              onClick={() => switchPanel('notifications')}
            >
              <span className="settings-nav-icon"><FaBell /></span>
              <span>Notifications</span>
            </div> */}

            {/* <div
              className={`settings-nav-item ${activePanel === 'privacy' ? 'active' : ''}`}
              onClick={() => switchPanel('privacy')}
            >
              <span className="settings-nav-icon"><FaLock /></span>
              <span>Privacy & Security</span>
            </div> */}

            {/* <div
              className={`settings-nav-item ${activePanel === 'connected' ? 'active' : ''}`}
              onClick={() => switchPanel('connected')}
            >
              <span className="settings-nav-icon"><FaLink /></span>
              <span>Connected Apps</span>
            </div> */}

            {/* <div
              className={`settings-nav-item ${activePanel === 'account' ? 'active' : ''}`}
              onClick={() => switchPanel('account')}
            >
              <span className="settings-nav-icon"><FaUserCircle /></span>
              <span>Account</span>
            </div> */}
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {/* General Panel */}
            <div
              className={`settings-panel ${
                activePanel === "general" ? "active" : ""
              }`}
            >
              <h2 className="settings-title">General</h2>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Theme</label>
                  <p className="settings-description">
                    Choose your preferred color theme
                  </p>
                </div>
                <div className="settings-control">
                  <select className="settings-select">
                    <option>System</option>
                    <option>Dark</option>
                    <option>Light</option>
                  </select>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Language</label>
                  <p className="settings-description">
                    Select your preferred language
                  </p>
                </div>
                <div className="settings-control">
                  <select className="settings-select">
                    <option>Auto-detect</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Time Zone</label>
                  <p className="settings-description">
                    Set your local time zone for scheduling
                  </p>
                </div>
                <div className="settings-control">
                  <select className="settings-select">
                    <option>Auto-detect</option>
                    <option>UTC-08:00 Pacific</option>
                    <option>UTC-05:00 Eastern</option>
                    <option>UTC+00:00 GMT</option>
                    <option>UTC+01:00 CET</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile & Interests Panel */}
            <div
              className={`settings-panel ${
                activePanel === "profile" ? "active" : ""
              }`}
            >
              <h2 className="settings-title">Profile & Interests</h2>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Display Name</label>
                  <p className="settings-description">
                    This is how you`&apos;`ll appear to other collaborators
                  </p>
                </div>
                <div className="settings-control">
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Bio</label>
                  <p className="settings-description">
                    Tell others about yourself and your expertise
                  </p>
                </div>
                <div className="settings-control">
                  <textarea
                    className="settings-input"
                    placeholder="Tell us about yourself, your skills, and what you're passionate about..."
                    rows={4}
                    style={{ height: "auto", resize: "vertical" }}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-header-row">
                  <div className="settings-header-content">
                    <label className="settings-label">Areas of Interest</label>
                    <p className="settings-description">
                      Select all that apply to get better project matches
                    </p>
                  </div>

                  <div className="search-container">
                    {!showSearch ? (
                      <button
                        className="settings-button add-button"
                        onClick={handleSearchToggle}
                        aria-label="Add interest"
                      >
                        <FaPlus size={16} />
                      </button>
                    ) : (
                      <div className="search-dropdown">
                        <div className="search-input-container">
                          <FaSearch size={16} className="search-icon" />
                          <input
                            ref={searchRef}
                            type="text"
                            className="search-input"
                            placeholder="Search interests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button
                            className="close-search-button"
                            onClick={handleSearchToggle}
                            aria-label="Close search"
                          >
                            <FaX size={16} />
                          </button>
                        </div>

                        {filteredInterests.length > 0 && (
                          <div className="search-results">
                            {filteredInterests
                              .slice(0, 8)
                              .map((interest: string) => (
                                <button
                                  key={interest}
                                  className="search-result-item"
                                  onClick={() => addInterest(interest)}
                                >
                                  {interest}
                                </button>
                              ))}
                            {filteredInterests.length > 8 && (
                              <div className="search-more-indicator">
                                +{filteredInterests.length - 8} more...
                              </div>
                            )}
                          </div>
                        )}

                        {searchQuery && filteredInterests.length === 0 && (
                          <div className="search-no-results">
                            No matching interests found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="settings-checkbox-group">
                  {selectedInterests.map((interest) => (
                    <div
                      key={interest}
                      className={`settings-checkbox-item ${
                        editedInterests.includes(interest) ? "selected" : ""
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      <input
                        type="checkbox"
                        className="settings-checkbox"
                        checked={editedInterests.includes(interest)}
                        onChange={() => console.log()}
                        readOnly
                      />
                      <label>{interest}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Preferences Panel */}
            {/* <div className={`settings-panel ${activePanel === 'projects' ? 'active' : ''}`}>
            <h2 className="settings-title">Project Preferences</h2>
            
            <div className="settings-row">
              <div className="settings-label-group">
                <label className="settings-label">Project Type</label>
                <p className="settings-description">What kind of projects are you looking for?</p>
              </div>
              <div className="settings-control">
                <select className="settings-select">
                  <option>All Types</option>
                  <option>Open Source</option>
                  <option>Startups</option>
                  <option>Research</option>
                  <option>Hackathons</option>
                  <option>Learning Projects</option>
                </select>
              </div>
            </div>
            
            <div className="settings-row">
              <div className="settings-label-group">
                <label className="settings-label">Availability</label>
                <p className="settings-description">How much time can you commit?</p>
              </div>
              <div className="settings-control">
                <select className="settings-select">
                  <option>Part-time (&lt; 10 hrs/week)</option>
                  <option>Half-time (10-20 hrs/week)</option>
                  <option>Full-time (&gt; 20 hrs/week)</option>
                  <option>Flexible</option>
                </select>
              </div>
            </div>
            
            <div className="settings-row">
              <div className="settings-label-group">
                <label className="settings-label">Work Preference</label>
                <p className="settings-description">How do you prefer to collaborate?</p>
              </div>
              <div className="settings-control">
                <div className="settings-radio-group">
                  <div className="settings-radio-item">
                    <input type="radio" name="work" className="settings-radio" defaultChecked />
                    <label className="settings-radio-label">Remote</label>
                  </div>
                  <div className="settings-radio-item">
                    <input type="radio" name="work" className="settings-radio" />
                    <label className="settings-radio-label">In-Person</label>
                  </div>
                  <div className="settings-radio-item">
                    <input type="radio" name="work" className="settings-radio" />
                    <label className="settings-radio-label">Hybrid</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="settings-row">
              <div className="settings-label-group">
                <label className="settings-label">Max Team Size</label>
                <p className="settings-description">Preferred team size for projects</p>
              </div>
              <div className="settings-control">
                <select className="settings-select">
                  <option>No preference</option>
                  <option>2-3 people</option>
                  <option>4-6 people</option>
                  <option>7-10 people</option>
                  <option>10+ people</option>
                </select>
              </div>
            </div>
          </div> */}

            {/* Collaboration Panel */}
            <div
              className={`settings-panel ${
                activePanel === "collaboration" ? "active" : ""
              }`}
            >
              <h2 className="settings-title">Collaboration Settings</h2>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Profile Visibility</label>
                  <p className="settings-description">
                    Who can see your profile and projects?
                  </p>
                </div>
                <div className="settings-control">
                  <select
                    className="settings-select"
                    value={profileVisibility}
                    onChange={(e) =>
                      setProfileVisibility(
                        e.target.value as "public" | "private"
                      )
                    }
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              {/* <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Allow team invites</label>
                  <p className="settings-description">Let others invite you to join their projects</p>
                </div>
                <div className="settings-control">
                  <div className="settings-toggle active" onClick={(e) => toggleSwitch(e.currentTarget as HTMLElement)}>
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div> */}

              {/* <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Show online status</label>
                  <p className="settings-description">Let collaborators see when you`&apos;`re active</p>
                </div>
                <div className="settings-control">
                  <div className="settings-toggle" onClick={(e) => toggleSwitch(e.currentTarget as HTMLElement)}>
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div> */}

              {/* <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Message requests</label>
                  <p className="settings-description">Who can send you direct messages?</p>
                </div>
                <div className="settings-control">
                  <select className="settings-select">
                    <option>Anyone</option>
                    <option>People I follow</option>
                    <option>Team members only</option>
                    <option>No one</option>
                  </select>
                </div>
              </div> */}
            </div>

            {/* Notifications Panel */}
            <div
              className={`settings-panel ${
                activePanel === "notifications" ? "active" : ""
              }`}
            >
              <h2 className="settings-title">Notifications</h2>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Email notifications</label>
                  <p className="settings-description">
                    Receive updates via email
                  </p>
                </div>
                <div className="settings-control">
                  <div
                    className="settings-toggle active"
                    onClick={(e) =>
                      toggleSwitch(e.currentTarget as HTMLElement)
                    }
                  >
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Project invitations</label>
                  <p className="settings-description">
                    When someone invites you to a project
                  </p>
                </div>
                <div className="settings-control">
                  <div
                    className="settings-toggle active"
                    onClick={(e) =>
                      toggleSwitch(e.currentTarget as HTMLElement)
                    }
                  >
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">New messages</label>
                  <p className="settings-description">
                    When you receive a new message
                  </p>
                </div>
                <div className="settings-control">
                  <div
                    className="settings-toggle active"
                    onClick={(e) =>
                      toggleSwitch(e.currentTarget as HTMLElement)
                    }
                  >
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Project updates</label>
                  <p className="settings-description">
                    Updates from projects you`&apos;`re following
                  </p>
                </div>
                <div className="settings-control">
                  <div
                    className="settings-toggle"
                    onClick={(e) =>
                      toggleSwitch(e.currentTarget as HTMLElement)
                    }
                  >
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Weekly digest</label>
                  <p className="settings-description">
                    Summary of new projects matching your interests
                  </p>
                </div>
                <div className="settings-control">
                  <div
                    className="settings-toggle active"
                    onClick={(e) =>
                      toggleSwitch(e.currentTarget as HTMLElement)
                    }
                  >
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Security Panel */}
            <div
              className={`settings-panel ${
                activePanel === "privacy" ? "active" : ""
              }`}
            >
              <h2 className="settings-title">Privacy & Security</h2>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">
                    Two-factor authentication
                  </label>
                  <p className="settings-description">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="settings-control">
                  <button className="settings-button">Enable 2FA</button>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Session timeout</label>
                  <p className="settings-description">
                    Automatically log out after inactivity
                  </p>
                </div>
                <div className="settings-control">
                  <select className="settings-select">
                    <option>Never</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>8 hours</option>
                  </select>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Show email publicly</label>
                  <p className="settings-description">
                    Display your email on your profile
                  </p>
                </div>
                <div className="settings-control">
                  <div
                    className={`settings-toggle ${
                      showEmailPublicly ? "active" : ""
                    }`}
                    onClick={() => setShowEmailPublicly(!showEmailPublicly)}
                  >
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Data sharing</label>
                  <p className="settings-description">
                    Share anonymous usage data to improve the platform
                  </p>
                </div>
                <div className="settings-control">
                  <div
                    className="settings-toggle active"
                    onClick={(e) =>
                      toggleSwitch(e.currentTarget as HTMLElement)
                    }
                  >
                    <div className="settings-toggle-slider"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Apps Panel */}
            <div
              className={`settings-panel ${
                activePanel === "connected" ? "active" : ""
              }`}
            >
              <h2 className="settings-title">Connected Apps</h2>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">GitHub</label>
                  <p className="settings-description">
                    Sync your repositories and contributions
                  </p>
                </div>
                <div className="settings-control">
                  <button className="settings-button">Connect</button>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">LinkedIn</label>
                  <p className="settings-description">
                    Import your professional profile
                  </p>
                </div>
                <div className="settings-control">
                  <button className="settings-button">Connect</button>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Slack</label>
                  <p className="settings-description">
                    Get notifications in your Slack workspace
                  </p>
                </div>
                <div className="settings-control">
                  <button className="settings-button">Connect</button>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Discord</label>
                  <p className="settings-description">
                    Join project discussions on Discord
                  </p>
                </div>
                <div className="settings-control">
                  <button className="settings-button">Connect</button>
                </div>
              </div>
            </div>

            {/* Account Panel */}
            <div
              className={`settings-panel ${
                activePanel === "account" ? "active" : ""
              }`}
            >
              <h2 className="settings-title">Account</h2>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Email</label>
                  <p className="settings-description">
                    Your primary email address
                  </p>
                </div>
                <div className="settings-control">
                  <input
                    type="email"
                    className="settings-input"
                    value={settings?.email || ""}
                    placeholder="user@example.com"
                    disabled
                    style={{ backgroundColor: "#1a1a1a", color: "#6b7280" }}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Change Password</label>
                  <p className="settings-description">
                    Update your account password
                  </p>
                </div>
                <div className="settings-control">
                  <button
                    className="settings-button"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Export Data</label>
                  <p className="settings-description">
                    Download all your data and projects
                  </p>
                </div>
                <div className="settings-control">
                  <button className="settings-button">Export</button>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label-group">
                  <label className="settings-label">Delete Account</label>
                  <p className="settings-description">
                    Permanently delete your account and all data
                  </p>
                </div>
                <div className="settings-control">
                  <button className="settings-button danger">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Close main content wrapper */}
        </div>

        {/* Bottom action buttons - outside of scrollable content */}
        <div className="settings-footer">
          <button
            className="settings-cancel-button"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className={`settings-save-button ${isSaving ? "saving" : ""}`}
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPopup;
