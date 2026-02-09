# Component Splitting Guide

This guide shows how to refactor large components into smaller, reusable pieces.

## Large Components Identified

### 1. NavbarWithMusic.tsx (788 lines)
**Responsibilities:** Music player, theme toggle, font menu, animation controls, wallet connection

**Suggested Split:**
```
components/
├── NavbarWithMusic.tsx          (wrapper, ~150 lines)
├── navbar/
│   ├── MusicPlayer.tsx          (~200 lines) - Music controls & waveform
│   ├── ThemeToggle.tsx          (~80 lines)  - Dark/light theme switch
│   ├── SettingsMenu.tsx         (~200 lines) - Fonts, animations, colors
│   └── WalletDisplay.tsx        (~100 lines) - Wallet connection
```

### 2. AIGirlfriendsTabs.tsx (480 lines)
**Responsibilities:** Tab management, multiple AI girlfriend profiles, filtering

**Suggested Split:**
```
components/ai-girlfriends/
├── AIGirlfriendsTabs.tsx        (wrapper, ~100 lines)
├── AIGirlfriendCard.tsx         (~120 lines) - Individual profile
├── AIGirlfriendFilter.tsx       (~100 lines) - Filtering/search
└── AIGirlfriendsList.tsx        (~160 lines) - List rendering
```

### 3. ClientSignupForm.tsx (445 lines)
**Responsibilities:** Multi-step form, validation, API calls

**Suggested Split:**
```
components/auth/
├── ClientSignupForm.tsx         (wrapper, ~100 lines)
├── SignupStep1.tsx              (~120 lines) - Basic info
├── SignupStep2.tsx              (~120 lines) - Details
├── SignupValidation.tsx         (~50 lines)  - Zod schemas
└── SignupSuccess.tsx            (~55 lines)  - Confirmation
```

## Refactoring Checklist

For each large component:

- [ ] **Identify Concerns** - What distinct responsibilities exist?
- [ ] **Extract Sub-components** - Create smaller focused components
- [ ] **Create Shared Folder** - Organize related components together
- [ ] **Use Props Clearly** - Define clear interfaces for each sub-component
- [ ] **Test Each Part** - Ensure sub-components work independently
- [ ] **Document Relationships** - Add comments explaining component hierarchy
- [ ] **Verify Backwards Compatibility** - Ensure the wrapper works like the original

## Example: Refactoring NavbarWithMusic

### Step 1: Create folder structure
```bash
mkdir -p components/navbar
touch components/navbar/{MusicPlayer,ThemeToggle,SettingsMenu,WalletDisplay}.tsx
```

### Step 2: Extract MusicPlayer
```typescript
// components/navbar/MusicPlayer.tsx
interface MusicPlayerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrack: Track;
  setCurrentTrack: (track: Track) => void;
  tracks: Track[];
}

export function MusicPlayer({ isPlaying, setIsPlaying, ...props }: MusicPlayerProps) {
  // Music player logic here
  return (
    <div className="music-player">
      {/* Player UI */}
    </div>
  );
}
```

### Step 3: Update wrapper
```typescript
// components/NavbarWithMusic.tsx
export default function NavbarWithMusic(props: NavbarWithMusicProps) {
  const { isPlaying, setIsPlaying, ...musicProps } = usePersistentMusic();

  return (
    <nav>
      <MusicPlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} {...musicProps} />
      <ThemeToggle isDark={props.isDark} setIsDark={props.setIsDark} />
      <SettingsMenu {...settingsProps} />
      <WalletDisplay {...walletProps} />
    </nav>
  );
}
```

### Step 4: Test thoroughly
- Ensure MusicPlayer works independently
- Verify props flow correctly
- Check that callbacks still work
- Test on mobile and desktop

## Benefits of Splitting

✅ **Readability** - Easier to understand focused components
✅ **Reusability** - Use MusicPlayer in other places
✅ **Testability** - Easier to test individual pieces
✅ **Maintainability** - Changes affect smaller surface area
✅ **Performance** - Can memo/lazy-load individual components

## When to Split Components

Split a component when it:
- Has **>300 lines** of code
- Manages **>5 independent pieces** of state
- Has **multiple distinct UI sections**
- Could be **reused elsewhere**
- Is **hard to understand** as a whole

## Tools for Analysis

Use these commands to identify candidates for splitting:

```bash
# Find all components with >300 lines
wc -l components/*.tsx | sort -rn | head -10

# Count props in a component
grep -o "^\s*[a-zA-Z_][a-zA-Z0-9_]*\?" components/Large Component.tsx | wc -l

# Find deeply nested JSX
grep -c ">" components/LargeComponent.tsx
```

## Related Documentation

- See `ARCHITECTURE.md` for overall project structure
- See `CODE_STYLE.md` for component naming conventions
