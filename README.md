# Tapioca EMDR

A secure, web-based platform for conducting Eye Movement Desensitization and Reprocessing (EMDR) therapy sessions online. Built specifically for therapists and clients to engage in effective trauma processing through bilateral stimulation tools and encrypted video communication.

## 🎯 Use Case

Tapioca EMDR addresses the growing need for accessible, secure online therapy platforms specifically designed for EMDR treatment. The application enables:

- **Therapists** to conduct EMDR sessions remotely with clients
- **Clients** to receive trauma processing therapy from the comfort of their home
- **Secure video communication** with end-to-end encryption
- **Bilateral stimulation tools** for effective EMDR treatment
- **HIPAA-compliant** therapy sessions
- **No software downloads** required - works entirely in the browser

## 🛠️ Technologies Used

### Frontend
- **Next.js 15.3.2** - React framework for server-side rendering and routing
- **React 19.0.0** - UI library for building interactive components
- **TypeScript 5** - Type-safe JavaScript development
- **SASS/SCSS** - Advanced CSS preprocessing for styling
- **React Icons** - Icon library for UI elements

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service for authentication and database
- **Auth0** - Identity and access management
- **PeerJS** - WebRTC peer-to-peer communication for video calls
- **Twilio** - Video and communication services integration

### Development Tools
- **ESLint** - Code linting and quality assurance
- **TypeScript** - Static type checking
- **Next.js Config** - Framework configuration

## 🔐 Security Features

- **End-to-end encryption** for all video communications
- **HIPAA-compliant** data handling
- **Secure authentication** via Auth0 and Supabase
- **Peer-to-peer video streaming** for enhanced privacy
- **No data storage** of sensitive therapy content

## 🎨 Key Features

### For Therapists
- Create secure video sessions with clients
- Control bilateral stimulation tools
- Manage client connections via unique peer IDs
- Monitor session status and connection quality
- Switch between multiple cameras and microphones

### For Clients
- Join therapy sessions with simple peer ID entry
- Receive bilateral stimulation during EMDR processing
- Access sessions from any device with a web browser
- Maintain privacy with encrypted communications

### Technical Features
- **Real-time video communication** via WebRTC
- **Bilateral stimulation tools** for EMDR treatment
- **Device management** (camera/microphone switching)
- **Responsive design** for desktop and mobile use
- **Connection status monitoring**
- **Automatic session management**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd emdr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   AUTH0_SECRET=your_auth0_secret
   AUTH0_BASE_URL=your_base_url
   AUTH0_ISSUER_BASE_URL=your_auth0_issuer_url
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # React components
│   │   ├── AuthModal.tsx   # Authentication modal
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Hero.tsx        # Landing page hero section
│   │   ├── VisualElement.tsx # EMDR bilateral stimulation
│   │   └── ...
│   ├── context/            # React context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── PeerContext.tsx # WebRTC peer management
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   └── styles/             # SCSS styling
└── ...
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 About

Tapioca EMDR is built with ❤ in Boulder, CO, designed to make EMDR therapy accessible to anyone who needs it, regardless of location or circumstances. The platform prioritizes security, ease of use, and clinical effectiveness.

## 📄 License

This project is proprietary software. All rights reserved.

---

**Visit [tapiocaemdr.com](https://tapiocaemdr.com) to experience the platform in action.** 
