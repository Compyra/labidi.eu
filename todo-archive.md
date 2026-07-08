# Epic Project Brief: Futuristic Doctor Who-Inspired Start Page

## Professional Frontend Development Specification

### Project Vision
Create a cutting-edge, futuristic start page blending Doctor Who aesthetics with modern web design. This portal serves as a centralized hub for navigation, project management, and visitor information with space-themed interactions and responsive design excellence.

---

## Core Design Requirements

### Visual Foundation
- **Aesthetic**: Futuristic yet clean; Doctor Who-inspired (TARDIS blues, temporal aesthetics, retro-futurism)
- **Background**: Animated space particles and planets reacting to mouse movement in real-time
- **Color Palette**: Deep space blues, subtle purples, glowing accents, metallic elements
- **Typography**: Modern, readable sans-serif with sci-fi character

### Interactive Features

#### Hover/Focus States
- Icons and menu items trigger centerpiece animation
- Content expands to viewport center on interaction
- Smooth transitions; all elements animate away gracefully
- Easy selection and focus indication

#### Mouse Interaction System
- **Particle System**: Space particles follow/react to cursor movement
- **Planet Dynamics**: Planets subtly orbit or shift based on mouse position
- **Parallax Effects**: Multi-layer background depth following mouse trajectory
- **Smooth Tracking**: Low-latency cursor responsiveness across all devices

---

## Page Structure & Sections

### Header/Navigation
- Futuristic menu bar with iconic navigation
- Logo/branding with temporal/space theme
- Quick-access primary navigation

### Main Content Hub
- **Active Projects Section**: Ongoing work with progress indicators
- **Finished Projects Section**: Completed projects (many with dedicated subdomains)
- **Archived/Dropped Projects Section**: Shelved projects with archival status
- Each project card displays: title, description, status, link/subdomain

### Welcome Banner
- Dynamic greeting: "Welcome visitor"
- Current date/time integration
- Personal, warm messaging despite futuristic theme

### Footer
- Elegant timestamp and visitor message
- Contact/social links (if applicable)
- Subtle footer animation

---

## Technical Specifications

### Performance & Compatibility
- **Input Methods**: Full support for mouse, trackpad, keyboard arrows, button navigation, touch/swipe
- **Responsive Design**: Mobile-first approach; optimized for:
  - Desktop (1920px+, 1366px, 1024px)
  - Tablet (768px, 1024px)
  - Mobile (320px, 480px, 768px)
- **Accessibility**: ARIA labels, keyboard navigation, touch targets ≥44px
- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge)

### Technology Stack
- **HTML5**: Semantic markup, meta tags for responsiveness
- **CSS3**: Grid/Flexbox, animations, gradients, transforms, custom properties
- **JavaScript**: Canvas/WebGL for particle effects, event listeners, state management
- **Optional Enhancements**: GSAP/Three.js for advanced animations

### Key Implementation Areas

#### Particle System
- Canvas-based or CSS animation layer
- Particles spawn near cursor, drift through space
- Interactive physics (attraction/repulsion to cursor)
- Performance optimization: requestAnimationFrame

#### Responsive Layout
- CSS Grid for desktop layouts
- Flexbox for flexible components
- Media queries for breakpoints
- Touch-friendly spacing and sizing

#### State Management
- Track active project filter (all/active/finished/archived)
- Remember user preferences (dark/light, animation intensity)
- Smooth transitions between states

---

## Timeline & Scope
- **Complexity**: High; allow extended development for polish
- **Animation Refinement**: Multiple iterations for smooth, performant effects
- **Testing**: Extensive device/input method testing
- **Optimization**: Performance profiling and optimization passes

---

## Success Criteria
✅ Stunning visual presentation with space theme clearly evident  
✅ Smooth, responsive interactions across all input methods  
✅ Perfect responsiveness on all screen sizes  
✅ Performance: 60fps animations, <3s initial load  
✅ Intuitive navigation; visitors immediately understand purpose  
✅ Professional presentation suitable for personal portfolio hub  
✅ Projects clearly categorized and linked  
✅ Welcoming, user-friendly atmosphere despite high-tech aesthetic  

---

## Notes
- Prioritize performance over flashy effects
- Ensure accessibility doesn't compromise design
- Test extensively on real devices, not just browser DevTools
- Consider prefers-reduced-motion for accessibility
- Balance sci-fi theme with usability
- The website name is labidi.eu
- Make the site ready to work in multiple languages
