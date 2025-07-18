"use client";
import React, { useState, useEffect, ReactNode } from 'react';

// A simple toast notification component for copy feedback
const Toast = ({ message, show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fadeInOut">
      {message}
    </div>
  );
};

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="mb-12">
    <h2 className="text-2xl font-headline text-primary mb-4 pb-2 border-b border-border">
      {title}
    </h2>
    <div className="flex flex-wrap gap-4 items-start">{children}</div>
  </div>
);

interface ClickToCopyProps {
  children: ReactNode;
  classNameToCopy: string; // Renamed to avoid conflict with actual element className
  renderAs?: keyof HTMLElementTagNameMap; // Optional prop to render as a different HTML element
  displayClassName?: boolean; // Optional prop to display the class name below the element
  onClick?: (e: React.MouseEvent) => void; // Allow custom onClick for nested elements like input
}

const ClickToCopy = ({ children, classNameToCopy, renderAs = 'div', displayClassName = true, onClick }: ClickToCopyProps) => {
  const [showToast, setShowToast] = useState(false);
  const Component = renderAs; // Dynamic tag name

  const handleCopyClick = async (e: React.MouseEvent) => {
    // If a custom onClick is provided, call it first
    if (onClick) {
      onClick(e);
    }
    // Only copy if the event wasn't stopped by a child (e.g., input)
    if (!e.defaultPrevented) {
      try {
        await navigator.clipboard.writeText(classNameToCopy);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000); // Hide toast after 2 seconds
      } catch (err) {
        console.error('Failed to copy class:', err);
      }
    }
  };

  return (
    <Component
      className={classNameToCopy.split(' ').filter(c => !c.startsWith('text-[')).join(' ')} // Apply classes for styling, filter out direct text sizes
      onClick={handleCopyClick}
      style={{ cursor: 'copy' }} // Indicate it's clickable
      title={`Click to copy: "${classNameToCopy}"`}
    >
      {children}
      {displayClassName && (
        <p className="mt-2 text-xs text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
          .{classNameToCopy.split(' ').join('.')}
        </p>
      )}
      <Toast message="Classes copied!" show={showToast} onClose={() => setShowToast(false)} />
    </Component>
  );
};


// Color Box Component
interface ColorBoxProps {
  colorVar: string;
  label: string;
  isBg?: boolean; // For background colors
  isBorder?: boolean; // For border colors
  isInput?: boolean; // For input colors
}

const ColorBox = ({ colorVar, label, isBg, isBorder, isInput }: ColorBoxProps) => {
  const colorClass = isBg ? `bg-${colorVar}` : isBorder ? `border-${colorVar}` : `text-${colorVar}`;
  const displayClass = isBg ? `bg-${colorVar}` : isBorder ? `border-2 border-${colorVar} p-4` : `text-${colorVar}`;
  const fgColorClass = colorVar.includes('-foreground') ? colorVar : `${colorVar}-foreground`;
  const fgColorDisplay = fgColorClass.startsWith('var(') ? 'text-primary-foreground' : `text-${fgColorClass}`;


  const renderContent = () => {
    if (isInput) {
      return (
        <input
          type="text"
          className={`w-full p-2 rounded-md outline-none border ${colorVar} text-foreground`}
          placeholder={`Input with ${label}`}
          onClick={(e) => e.stopPropagation()} // Prevent parent copy on input click
        />
      );
    }
    return (
      <>
        {isBg || isBorder ? (
          <p className={`${fgColorDisplay} font-semibold text-sm`}>
            {label}
          </p>
        ) : (
          <p className={`${colorClass} font-semibold text-sm`}>
            {label}
          </p>
        )}
      </>
    );
  };

  return (
    <ClickToCopy classNameToCopy={`${isBg ? `p-4 h-24 w-40 rounded-md shadow-sm flex items-center justify-center ${colorClass}` : isBorder ? `p-4 h-24 w-40 rounded-md shadow-sm flex items-center justify-center border-2 ${colorClass}` : `w-32 h-20 flex items-center justify-center ${colorClass}`} text-center transition-colors duration-300`}
      displayClassName={false} // We display the label inside the box
    >
      {renderContent()}
    </ClickToCopy>
  );
};


// Custom component for font family examples
const FontExample = ({ fontClass, label, text }: { fontClass: string; label: string; text: string }) => (
  <ClickToCopy classNameToCopy={`${fontClass} text-lg text-foreground`} renderAs="p">
    <span className="font-bold text-primary mr-2">{label}:</span> {text}
  </ClickToCopy>
);


export default function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  const colorPalette = {
    "Background": { class: "background", type: "bg" },
    "Foreground": { class: "foreground", type: "text" },
    "Primary": { class: "primary", type: "group", children: { "Default": "primary", "Foreground": "primary-foreground" } },
    "Secondary": { class: "secondary", type: "group", children: { "Default": "secondary", "Foreground": "secondary-foreground" } },
    "Destructive": { class: "destructive", type: "group", children: { "Default": "destructive", "Foreground": "destructive-foreground" } },
    "Muted": { class: "muted", type: "group", children: { "Default": "muted", "Foreground": "muted-foreground" } },
    "Accent": { class: "accent", type: "group", children: { "Default": "accent", "Foreground": "accent-foreground" } },
    "Popover": { class: "popover", type: "group", children: { "Default": "popover", "Foreground": "popover-foreground" } },
    "Card": { class: "card", type: "group", children: { "Default": "card", "Foreground": "card-foreground" } },
    "Border": { class: "border", type: "border" },
    "Input": { class: "input", type: "input" },
    "Ring": { class: "ring", type: "ring" },
    "Sidebar": {
      class: "sidebar", type: "group", children: {
        "Default": "sidebar",
        "Foreground": "sidebar-foreground",
        "Primary Default": "sidebar-primary",
        "Primary Foreground": "sidebar-primary-foreground",
        "Accent Default": "sidebar-accent",
        "Accent Foreground": "sidebar-accent-foreground",
        "Border": "sidebar-border",
        "Ring": "sidebar-ring",
      }
    },
    "Chart Colors": {
      class: "chart", type: "group", children: {
        "Chart 1": "chart-1", "Chart 2": "chart-2", "Chart 3": "chart-3",
        "Chart 4": "chart-4", "Chart 5": "chart-5"
      }
    }
  };

  return (
    <div className={`p-8 font-sans transition-colors duration-300 ${theme}`}>
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(20px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 2s ease-in-out forwards;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-headline font-bold text-foreground animate-fadeIn">
            Theme & Style Guide Test
          </h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-all"
          >
            Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </header>

        {/* Color Palette Section */}
        <Section title="Color Palette">
          {Object.entries(colorPalette).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-2 p-2 rounded-md border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-2">{key}</h3>
              {value.type === "group" ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(value.children).map(([childKey, childValue]) => (
                    <ColorBox
                      key={childKey}
                      colorVar={childValue}
                      label={childKey}
                      isBg={!childKey.includes('Foreground') && !childKey.includes('Border') && !childKey.includes('Ring')}
                      isBorder={childKey.includes('Border')}
                      isInput={false} // No direct input for grouped colors
                    />
                  ))}
                </div>
              ) : (
                <ColorBox
                  colorVar={value.class}
                  label={key}
                  isBg={value.type === "bg" || value.type === "group"}
                  isBorder={value.type === "border"}
                  isInput={value.type === "input"}
                />
              )}
            </div>
          ))}
        </Section>


        {/* Typography Section */}
        <Section title="Typography">
          <div className="w-full space-y-4">
            <FontExample fontClass="font-header" label="Header Font (Space Grotesk)" text="Hello, World! - Designed for impactful headings." />
            <FontExample fontClass="font-sans" label="Sans Serif Font (Inter)" text="The quick brown fox jumps over the lazy dog. - Ideal for body text." />
            <FontExample fontClass="font-serif" label="Serif Font" text="The quick brown fox jumps over the lazy dog. - Classic and readable." />
            <FontExample fontClass="font-mono bg-muted p-2 rounded-md" label="Monospace Font" text="const myVar = 'value';" />
          </div>
        </Section>

        {/* Responsive Typography Section */}
        <Section title="Responsive Typography Scale">
          <div className="w-full space-y-6">
            <div>
              <ClickToCopy classNameToCopy="font-headline text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground" renderAs="h3">
                Responsive Heading Example
              </ClickToCopy>
              <ClickToCopy classNameToCopy="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground" renderAs="p">
                This text will adapt its size based on the screen width.
              </ClickToCopy>
            </div>
            <div>
              <ClickToCopy classNameToCopy="font-headline text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-primary" renderAs="h4">
                Smaller Responsive Heading
              </ClickToCopy>
              <ClickToCopy classNameToCopy="text-xs sm:text-sm md:text-base lg:text-lg text-foreground" renderAs="p">
                Body text for different breakpoints.
              </ClickToCopy>
            </div>
            <div>
              <ClickToCopy classNameToCopy="font-mono text-xs sm:text-sm md:text-base bg-muted text-muted-foreground p-2 rounded-md" renderAs="p">
                <span>Code example: </span>
                <span className="text-[0.7rem] sm:text-xs md:text-sm lg:text-base">
                  .responsive-class {'{'} font-size: 1rem; {'}'} @media (min-width: 640px) {'{'} font-size: 1.25rem; {'}'}
                </span>
              </ClickToCopy>
            </div>
          </div>
        </Section>

        {/* Components & Interactive Elements Section */}
        <Section title="Components & Interactive Elements">
          <div className="w-full space-y-4">
            <div className="flex flex-wrap gap-4">
              <ClickToCopy classNameToCopy="px-6 py-2 bg-primary text-primary-foreground rounded-md shadow-lg hover:opacity-90" renderAs="button">
                Primary Button
              </ClickToCopy>
              <ClickToCopy classNameToCopy="px-6 py-2 bg-secondary text-secondary-foreground rounded-md shadow-lg hover:opacity-90" renderAs="button">
                Secondary Button
              </ClickToCopy>
              <ClickToCopy classNameToCopy="px-6 py-2 bg-destructive text-destructive-foreground rounded-md shadow-lg hover:opacity-90" renderAs="button">
                Destructive
              </ClickToCopy>
            </div>
            <div>
              <ClickToCopy
                classNameToCopy="w-full max-w-sm p-3 bg-input text-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
                renderAs="div"
                onClick={(e) => e.stopPropagation()} // Prevent parent div's click event
              >
                <input
                  type="text"
                  placeholder="This is an input field..."
                  className="w-full bg-transparent outline-none"
                />
              </ClickToCopy>
            </div>
            <ClickToCopy classNameToCopy="p-6 bg-card text-card-foreground rounded-xl shadow-xl border border-border">
              <h3 className="text-xl font-headline mb-2">Card Component</h3>
              <p>This is a card, which uses the card background and foreground colors, has a large radius and a heavy shadow.</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-6 bg-popover text-popover-foreground rounded-lg shadow-md border border-border">
              <h3 className="text-lg font-headline mb-2">Popover Component</h3>
              <p>This is a popover styled element.</p>
            </ClickToCopy>
          </div>
        </Section>

        {/* Borders Section */}
        <Section title="Borders">
          <div className="w-full flex flex-wrap gap-4 items-end">
            <ClickToCopy classNameToCopy="p-8 bg-card border-2 border-border rounded-sm flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Rounded SM</p>
              <p className="text-xs text-muted-foreground text-center">`rounded-sm`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card border-2 border-border rounded-md flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Rounded MD</p>
              <p className="text-xs text-muted-foreground text-center">`rounded-md`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card border-2 border-border rounded-lg flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Rounded LG</p>
              <p className="text-xs text-muted-foreground text-center">`rounded-lg`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card border-2 border-border rounded-xl flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Rounded XL</p>
              <p className="text-xs text-muted-foreground text-center">`rounded-xl`</p>
            </ClickToCopy>
          </div>
        </Section>

        {/* Box Shadows Section */}
        <Section title="Box Shadows">
          <div className="w-full flex flex-wrap gap-4 items-end">
            <ClickToCopy classNameToCopy="p-8 bg-card rounded-md shadow-2xs flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Shadow 2XS</p>
              <p className="text-xs text-muted-foreground text-center">`shadow-2xs`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card rounded-md shadow-xs flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Shadow XS</p>
              <p className="text-xs text-muted-foreground text-center">`shadow-xs`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card rounded-md shadow-sm flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Shadow SM</p>
              <p className="text-xs text-muted-foreground text-center">`shadow-sm`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card rounded-md shadow-md flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Shadow MD</p>
              <p className="text-xs text-muted-foreground text-center">`shadow-md`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card rounded-md shadow-lg flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Shadow LG</p>
              <p className="text-xs text-muted-foreground text-center">`shadow-lg`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card rounded-md shadow-xl flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Shadow XL</p>
              <p className="text-xs text-muted-foreground text-center">`shadow-xl`</p>
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-8 bg-card rounded-md shadow-2xl flex-grow" displayClassName={false}>
              <p className="text-foreground text-sm font-semibold text-center">Shadow 2XL</p>
              <p className="text-xs text-muted-foreground text-center">`shadow-2xl`</p>
            </ClickToCopy>
          </div>
        </Section>

        {/* Letter Spacing Section */}
        <Section title="Letter Spacing">
          <div className="w-full space-y-4">
            <ClickToCopy classNameToCopy="text-foreground text-lg tracking-tighter" renderAs="p">
              <span className="font-bold text-primary">Tighter:</span> The quick brown fox.
            </ClickToCopy>
            <ClickToCopy classNameToCopy="text-foreground text-lg tracking-tight" renderAs="p">
              <span className="font-bold text-primary">Tight:</span> The quick brown fox.
            </ClickToCopy>
            <ClickToCopy classNameToCopy="text-foreground text-lg tracking-normal" renderAs="p">
              <span className="font-bold text-primary">Normal:</span> The quick brown fox.
            </ClickToCopy>
            <ClickToCopy classNameToCopy="text-foreground text-lg tracking-wide" renderAs="p">
              <span className="font-bold text-primary">Wide:</span> The quick brown fox.
            </ClickToCopy>
            <ClickToCopy classNameToCopy="text-foreground text-lg tracking-wider" renderAs="p">
              <span className="font-bold text-primary">Wider:</span> The quick brown fox.
            </ClickToCopy>
            <ClickToCopy classNameToCopy="text-foreground text-lg tracking-widest" renderAs="p">
              <span className="font-bold text-primary">Widest:</span> The quick brown fox.
            </ClickToCopy>
          </div>
        </Section>

        {/* Spacing Section */}
        <Section title="Spacing">
          <div className="w-full flex flex-wrap items-end gap-4">
            <div className="flex flex-col items-center">
              <ClickToCopy classNameToCopy="w-8 h-8 bg-primary rounded-sm" displayClassName={false}>
                <p className="text-primary-foreground text-sm font-semibold text-center pt-2">8</p>
              </ClickToCopy>
              <p className="text-muted-foreground text-xs mt-1">`p-2` (8px)</p>
            </div>
            <div className="flex flex-col items-center">
              <ClickToCopy classNameToCopy="w-16 h-16 bg-primary rounded-sm" displayClassName={false}>
                <p className="text-primary-foreground text-sm font-semibold text-center pt-5">16</p>
              </ClickToCopy>
              <p className="text-muted-foreground text-xs mt-1">`p-4` (16px)</p>
            </div>
            <div className="flex flex-col items-center">
              <ClickToCopy classNameToCopy="w-24 h-24 bg-primary rounded-sm" displayClassName={false}>
                <p className="text-primary-foreground text-sm font-semibold text-center pt-8">24</p>
              </ClickToCopy>
              <p className="text-muted-foreground text-xs mt-1">`p-6` (24px)</p>
            </div>
            <div className="flex flex-col items-center">
              <ClickToCopy classNameToCopy="w-32 h-32 bg-primary rounded-sm" displayClassName={false}>
                <p className="text-primary-foreground text-sm font-semibold text-center pt-12">32</p>
              </ClickToCopy>
              <p className="text-muted-foreground text-xs mt-1">`p-8` (32px)</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 w-full">
            *Note: `spacing` is defined as `DEFAULT: "var(--spacing)"`. You can use values like `p-2`, `m-4`, `gap-8` which correspond to multiples of your base spacing unit. Sizes shown are illustrative.
          </p>
        </Section>


        {/* Keyframes Section */}
        <Section title="Keyframes & Animations">
          <div className="w-full space-y-4">
            <ClickToCopy classNameToCopy="text-foreground text-2xl font-bold animate-fadeIn" renderAs="p">
              This text fades in!
            </ClickToCopy>
            <ClickToCopy classNameToCopy="p-4 bg-accent text-accent-foreground rounded-md inline-block animate-fadeIn" renderAs="div">
              <p>A Box with Fade-In Animation</p>
            </ClickToCopy>
            <p className="text-muted-foreground text-sm">
              The `fadeIn` animation is applied using `animate-fadeIn` class.
            </p>
            <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto text-sm">
              <code>
                {`keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
},
animation: {
  fadeIn: 'fadeIn 1s ease-in-out forwards',
},`}
              </code>
            </pre>
          </div>
        </Section>

        ---

        {/* Applied Section */}
        <Section title="Applied & Recommended Usage">
          <div className="w-full space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Colors for UI Elements</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li><strong className="text-primary">Primary:</strong> Use for main actions, active states, and key branding elements. E.g., buttons, important links, active navigation items.</li>
                <li><strong className="text-secondary">Secondary:</strong> For less prominent actions or elements that complement primary. E.g., secondary buttons, background elements in complex UIs.</li>
                <li><strong className="text-accent">Accent:</strong> To highlight specific information or create visual interest. E.g., small icons, highlights, notifications.</li>
                <li><strong className="text-destructive">Destructive:</strong> For irreversible actions or error states. E.g., delete buttons, error messages.</li>
                <li><strong className="text-muted">Muted:</strong> For less important text, disabled elements, or subtle backgrounds. E.g., placeholders, secondary labels.</li>
                <li><strong className="text-border">Border:</strong> For separators, outlines of containers and inputs.</li>
                <li><strong className="text-input">Input:</strong> The background color for input fields.</li>
                <li><strong className="text-card">Card:</strong> Background for distinct content blocks.</li>
                <li><strong className="text-popover">Popover:</strong> Background for temporary floating elements like tooltips or dropdowns.</li>
                <li><strong className="text-sidebar">Sidebar:</strong> Dedicated background for sidebar navigation.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Typography Choices</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li><strong className="font-header text-primary">`font-header` (Space Grotesk):</strong> Ideal for all headings (`h1`-`h6`), impactful titles, and any text needing strong visual presence.</li>
                <li><strong className="font-sans">`font-sans` (Inter):</strong> Best for general body text, paragraphs, and most UI labels due to its high readability.</li>
                <li><strong className="font-serif">`font-serif`:</strong> Use sparingly for a classic, sophisticated touch, perhaps in specific content sections or quotes.</li>
                <li><strong className="font-mono">`font-mono`:</strong> Perfect for code snippets, command-line output, and anything requiring fixed-width character alignment.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Border Radii Application</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li><strong className="rounded-sm">`rounded-sm` & `rounded-md`:</strong> For subtle rounding on smaller elements like buttons, tags, or input fields.</li>
                <li><strong className="rounded-lg">`rounded-lg` & `rounded-xl`:</strong> For more pronounced rounding on cards, modals, or larger containers to give a softer aesthetic.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Shadow Hierarchy</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li><strong className="shadow-2xs">`shadow-2xs` - `shadow-sm`:</strong> For subtle depth on interactive elements or very light separation.</li>
                <li><strong className="shadow-md">`shadow-md` - `shadow-lg`:</strong> Standard shadows for cards, popovers, and main content blocks to lift them from the background.</li>
                <li><strong className="shadow-xl">`shadow-xl` - `shadow-2xl`:</strong> For prominent elements like large modals, dropdowns, or elements that need to appear significantly elevated.</li>
              </ul>
            </div>
          </div>
        </Section>

        ---

        {/* Combinations Section */}
        <Section title="Recommended Combinations">
          <div className="w-full space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">1. Primary Accent Card</h3>
              <ClickToCopy classNameToCopy="p-6 bg-card text-card-foreground rounded-lg shadow-md border border-primary flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">💡</span>
                </div>
                <div>
                  <h4 className="text-lg font-headline text-primary mb-1">Feature Highlight</h4>
                  <p className="text-sm font-sans">
                    Use `card` background with a `primary` border and `primary-foreground` text for highlighted information.
                  </p>
                </div>
              </ClickToCopy>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">2. Subtle Muted Section</h3>
              <ClickToCopy classNameToCopy="p-6 bg-muted text-muted-foreground rounded-md border border-border">
                <h4 className="text-lg font-sans font-semibold text-foreground mb-2">Notice Area</h4>
                <p className="text-sm font-sans">
                  Combine `muted` background with `muted-foreground` text and a subtle `border` for less critical information or background sections.
                </p>
              </ClickToCopy>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">3. Interactive Primary Button</h3>
              <ClickToCopy classNameToCopy="px-8 py-3 bg-primary text-primary-foreground rounded-md shadow-lg hover:bg-primary/90 transition-all font-sans text-base">
                Click Me!
              </ClickToCopy>
              <p className="text-sm text-muted-foreground mt-2">
                A `primary` button with `primary-foreground` text, `rounded-md`, and a `shadow-lg` for clear calls to action. Uses `font-sans`.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">4. Destructive Action with Confirmation</h3>
              <ClickToCopy classNameToCopy="p-4 bg-destructive text-destructive-foreground rounded-lg shadow-sm font-sans">
                <p className="font-bold mb-1">Warning: Irreversible Action</p>
                <p className="text-sm">This action cannot be undone. Proceed with caution.</p>
                <button className="mt-3 px-4 py-2 bg-destructive-foreground text-destructive rounded-md hover:opacity-90 transition-opacity">Confirm Deletion</button>
              </ClickToCopy>
              <p className="text-sm text-muted-foreground mt-2">
                `destructive` background and `destructive-foreground` text for critical warnings.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">5. Elegant Header with Body Text</h3>
              <ClickToCopy classNameToCopy="font-header text-3xl text-foreground mb-2">
                Your Product Headline
              </ClickToCopy>
              <ClickToCopy classNameToCopy="font-sans text-lg text-foreground leading-relaxed">
                <p>
                  This is the main body paragraph providing details about your amazing product. It uses the `font-sans` for optimal readability and a comfortable `leading-relaxed` line height.
                </p>
              </ClickToCopy>
              <p className="text-sm text-muted-foreground mt-2">
                Combining `font-header` for titles and `font-sans` for paragraphs creates a balanced and professional look.
              </p>
            </div>

          </div>
        </Section>
      </div>
    </div>
  );
}