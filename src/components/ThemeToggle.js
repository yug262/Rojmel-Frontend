import React, { useState, useEffect } from 'react';
import '../css/ThemeToggle.css'; // We'll create this file next
import { GoSun } from "react-icons/go";
import { FaRegMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle the theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Use an effect to apply the theme class to the body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.querySelectorAll('#comp').forEach(element => {element.classList.add('dark-comp')})
      document.querySelectorAll('#comp').forEach(element => {element.classList.remove('light-comp')})
      document.querySelectorAll('#tag').forEach(element => {element.classList.add('dark-tag')})
      document.querySelectorAll('#tag').forEach(element => {element.classList.remove('tag')})
    } else {
      document.body.classList.remove('dark-mode');
      document.querySelectorAll('#comp').forEach(element => {element.classList.remove('dark-comp')})
      document.querySelectorAll('#comp').forEach(element => {element.classList.add('light-comp')})
      document.querySelectorAll('#tag').forEach(element => {element.classList.remove('dark-tag')})
      document.querySelectorAll('#tag').forEach(element => {element.classList.add('tag')})
    }
  }, [isDarkMode]);

  return (
    <button className="theme-toggle-button" onClick={toggleTheme} aria-label="Toggle light and dark mode">
      <div className="icons">
        <GoSun
          className={` ${isDarkMode ? 'hidden' : ''} justify-center`}
        />
        <FaRegMoon
          className={` ${isDarkMode ? '' : 'hidden'}`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;