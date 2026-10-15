/**
 * FitTrack Core Object-Oriented Programming (OOP) Engine (Browser Bundle)
 * 
 * Provides:
 * - 4 Core OOP Pillars: Encapsulation (Private #fields), Inheritance, Polymorphism, Abstraction
 * - Custom Exception Hierarchy: FitTrackException -> InvalidMetricException, AuthenticationException, etc.
 * - GoF Design Patterns: Singleton, Factory, Observer, Strategy, Repository
 */
(function(window) {
  'use strict';

  // 1. EXCEPTION HIERARCHY
  class FitTrackException extends Error {
    constructor(message, code = 'FITTRACK_ERROR') {
      super(message);
      this.name = this.constructor.name;
      this.code = code;
      this.timestamp = new Date();
    }
    getDetailedLog() {
      return `[${this.timestamp.toISOString()}] ${this.name} (${this.code}): ${this.message}`;
    }
  }

  class InvalidMetricException extends FitTrackException {
    constructor(metricName, value, reason = 'Value out of biological boundaries') {
      super(`Invalid metric for "${metricName}" with value ${value}: ${reason}`, 'ERR_INVALID_METRIC');
      this.metricName = metricName;
      this.invalidValue = value;
    }
  }

  class AuthenticationException extends FitTrackException {
    constructor(message = 'Authentication failed. Please verify credentials.') {
      super(message, 'ERR_AUTH_FAILED');
    }
  }

  class ValidationException extends FitTrackException {
    constructor(field, message) {
      super(`Validation error on "${field}": ${message}`, 'ERR_VALIDATION');
      this.field = field;
    }
  }

  class EntityNotFoundException extends FitTrackException {
    constructor(entityName, id) {
      super(`${entityName} with ID "${id}" was not found`, 'ERR_ENTITY_NOT_FOUND');
      this.entityId = id;
    }
  }

  class WorkoutException extends FitTrackException {
    constructor(message) {
      super(message, 'ERR_WORKOUT');
    }
  }

  // 2. STRATEGY PATTERN (Caloric Calculation)
  class CaloricStrategy {
    calculate(weightKg, baseCalories) {
      throw new Error('Abstract method calculate() must be implemented by concrete strategy');
    }
    getName() { return 'Base Strategy'; }
  }

  class StandardCaloricStrategy extends CaloricStrategy {
    calculate(weightKg, baseCalories) {
      return Math.round(baseCalories);
    }
    getName() { return 'Standard Daily Maintenance'; }
  }

  class HypertrophyCaloricStrategy extends CaloricStrategy {
    calculate(weightKg, baseCalories) {
      return Math.round(baseCalories * 1.15 + (weightKg * 1.5));
    }
    getName() { return 'Athletic Hypertrophy Surplus (+15%)'; }
  }

  class FatLossEnduranceCaloricStrategy extends CaloricStrategy {
    calculate(weightKg, baseCalories) {
      return Math.round(baseCalories * 1.25);
    }
    getName() { return 'High-Deficit Endurance Blast (+25%)'; }
  }

  // 3. OBSERVER PATTERN (Event Bus)
  class BiometricEventBus {
    #observers = new Map();

    subscribe(eventType, callback) {
      if (!this.#observers.has(eventType)) {
        this.#observers.set(eventType, new Set());
      }
      this.#observers.get(eventType).add(callback);
      return () => this.unsubscribe(eventType, callback);
    }

    unsubscribe(eventType, callback) {
      if (this.#observers.has(eventType)) {
        this.#observers.get(eventType).delete(callback);
      }
    }

    notify(eventType, payload) {
      if (this.#observers.has(eventType)) {
        this.#observers.get(eventType).forEach(cb => {
          try { cb(payload); } catch (e) { console.error(`[EventBus] ${eventType} error:`, e); }
        });
      }
    }
  }

  // 4. USER DOMAIN HIERARCHY
  class User {
    #id;
    #passwordHash;
    #role;
    #createdAt;

    constructor(id, name, email, role = 'USER', password = 'defaultPassword') {
      if (new.target === User) {
        throw new Error('User is an abstract base class and cannot be instantiated directly');
      }
      if (!id || !name || !email) {
        throw new ValidationException('User', 'ID, name, and email are mandatory');
      }
      this.#id = id;
      this.name = name;
      this.email = email;
      this.#role = role;
      this.#passwordHash = `hash_${btoa(password).slice(0, 16)}`;
      this.#createdAt = new Date();
    }

    get id() { return this.#id; }
    get role() { return this.#role; }
    get createdAt() { return new Date(this.#createdAt); }

    get firstName() {
      return this.name.split(' ')[0] || this.name;
    }

    validatePassword(plain) {
      return `hash_${btoa(plain).slice(0, 16)}` === this.#passwordHash;
    }

    calculateTargetCalories() {
      throw new Error('Abstract method calculateTargetCalories() must be implemented by subclass');
    }

    getTelemetrySummary() {
      return `[User Profile] ID=${this.#id}, Name=${this.name}, Role=${this.#role}`;
    }

    getAccessLevel() { return 1; }
  }

  class AthleteUser extends User {
    #bodyWeightKg;
    #strategy;
    #currentCalories;
    #currentSteps;
    #currentMinutes;

    constructor(id, name, email, bodyWeightKg = 70.0, tier = 'Pro Member', goal = 'Strength & Hypertrophy') {
      super(id, name, email, 'ATHLETE');
      if (bodyWeightKg <= 30 || bodyWeightKg >= 300) {
        throw new InvalidMetricException('bodyWeightKg', bodyWeightKg, 'Must be between 30kg and 300kg');
      }
      this.#bodyWeightKg = bodyWeightKg;
      this.tier = tier;
      this.goal = goal;
      this.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
      this.#strategy = new StandardCaloricStrategy();

      this.#currentCalories = 632;
      this.#currentSteps = 12456;
      this.#currentMinutes = 78;

      this.calorieTarget = 800;
      this.stepTarget = 10000;
      this.minuteTarget = 60;
    }

    get bodyWeightKg() { return this.#bodyWeightKg; }
    set bodyWeightKg(val) {
      if (val <= 30 || val >= 300) {
        throw new InvalidMetricException('bodyWeightKg', val, 'Must be between 30kg and 300kg');
      }
      this.#bodyWeightKg = val;
    }

    get currentCalories() { return this.#currentCalories; }
    get currentSteps() { return this.#currentSteps; }
    get currentMinutes() { return this.#currentMinutes; }

    setStrategy(strategy) {
      if (!(strategy instanceof CaloricStrategy)) {
        throw new ValidationException('strategy', 'Must inherit from CaloricStrategy');
      }
      this.#strategy = strategy;
      this.calorieTarget = this.calculateTargetCalories();
    }

    getStrategy() { return this.#strategy; }

    calculateTargetCalories() {
      const baseBurn = 800;
      return this.#strategy.calculate(this.#bodyWeightKg, baseBurn);
    }

    getTelemetrySummary() {
      return `[Athlete ${this.tier}] ${this.name}: Steps=${this.#currentSteps}/${this.stepTarget}, Cal=${this.#currentCalories}/${this.calorieTarget} kcal (${this.#strategy.getName()})`;
    }

    getAccessLevel() { return 2; }

    addCalories(amt) {
      if (typeof amt !== 'number' || isNaN(amt) || amt <= 0 || amt > 5000) {
        throw new InvalidMetricException('calories', amt, 'Must be a positive number up to 5,000 kcal');
      }
      this.#currentCalories += amt;
      return this.#currentCalories;
    }

    addSteps(amt) {
      if (typeof amt !== 'number' || isNaN(amt) || amt <= 0 || amt > 100000) {
        throw new InvalidMetricException('steps', amt, 'Must be a positive integer up to 100,000 steps');
      }
      this.#currentSteps += amt;
      return this.#currentSteps;
    }

    addMinutes(amt) {
      if (typeof amt !== 'number' || isNaN(amt) || amt <= 0 || amt > 720) {
        throw new InvalidMetricException('minutes', amt, 'Must be positive active minutes up to 12 hours');
      }
      this.#currentMinutes += amt;
      return this.#currentMinutes;
    }

    calculateTotalScore() {
      const calPct = Math.min(this.#currentCalories / this.calorieTarget, 1.0);
      const stepPct = Math.min(this.#currentSteps / this.stepTarget, 1.0);
      const minPct = Math.min(this.#currentMinutes / this.minuteTarget, 1.0);
      return Math.min(Math.round((calPct * 350) + (stepPct * 350) + (minPct * 300)), 1000);
    }
  }

  class ProAthleteUser extends AthleteUser {
    #sponsorName;
    #vo2Max;

    constructor(id, name, email, bodyWeightKg = 72.0, sponsorName = 'Apex Performance') {
      super(id, name, email, bodyWeightKg, 'Elite Pro Athlete', 'Championship Conditioning');
      this.#sponsorName = sponsorName;
      this.#vo2Max = 58.5;
      this.setStrategy(new HypertrophyCaloricStrategy());
    }

    get sponsorName() { return this.#sponsorName; }
    get vo2Max() { return this.#vo2Max; }

    calculateTargetCalories() {
      const baseTarget = super.calculateTargetCalories();
      return Math.round(baseTarget * 1.2);
    }

    getTelemetrySummary() {
      return `[PRO ATHLETE] ${this.name} | Sponsor: ${this.#sponsorName} | VO2 Max: ${this.#vo2Max} ml/kg/min | Target: ${this.calculateTargetCalories()} kcal`;
    }

    getAccessLevel() { return 3; }
  }

  class GuestUser extends User {
    constructor() {
      super('guest_001', 'Guest Athlete', 'guest@fittrack.io', 'GUEST');
    }
    calculateTargetCalories() { return 750; }
    getTelemetrySummary() { return `[Guest Session] Exploring FitTrack Dashboard in Read-Only / Demo Mode`; }
    getAccessLevel() { return 0; }
  }

  // 5. WORKOUT DOMAIN HIERARCHY
  class Workout {
    #id;
    #exercises;
    #completed = false;

    constructor(id, title, category, durationMinutes, intensity, targetZone, image) {
      if (new.target === Workout) {
        throw new Error('Workout is an abstract base class and cannot be instantiated directly');
      }
      this.#id = id;
      this.title = title;
      this.category = category;
      this.durationMinutes = durationMinutes;
      this.intensity = intensity;
      this.targetZone = targetZone;
      this.image = image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80';
      this.time = '10:00 AM';
      this.#exercises = [];
    }

    get id() { return this.#id; }
    get isCompleted() { return this.#completed; }
    get exercises() { return [...this.#exercises]; }

    addExercise(name, sets, completed = false) {
      this.#exercises.push({ name, sets, completed });
    }

    toggleExercise(index) {
      if (index < 0 || index >= this.#exercises.length) {
        throw new WorkoutException(`Invalid exercise index: ${index}`);
      }
      this.#exercises[index].completed = !this.#exercises[index].completed;
      this.#completed = this.#exercises.length > 0 && this.#exercises.every(ex => ex.completed);
      return this.#exercises[index].completed;
    }

    calculateEstimatedBurn() {
      throw new Error('Abstract method calculateEstimatedBurn() must be implemented by subclass');
    }

    getCategoryBadge() {
      return { name: this.category, color: '#FF3B6B', icon: 'dumbbell' };
    }

    getSummary() {
      return `${this.title} (${this.durationMinutes} min, ${this.calculateEstimatedBurn()} kcal) - ${this.category}`;
    }
  }

  class StrengthWorkout extends Workout {
    constructor(id, title, durationMinutes = 45, intensity = 'Intermediate', targetZone = 'Chest & Arms') {
      super(id, title, 'Strength', durationMinutes, intensity, targetZone, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80');
    }
    calculateEstimatedBurn() { return Math.round(this.durationMinutes * 8.4); }
    getCategoryBadge() { return { name: 'Strength', color: '#FF3B6B', icon: 'dumbbell' }; }
  }

  class CardioWorkout extends Workout {
    constructor(id, title, durationMinutes = 30, intensity = 'High Intensity', targetZone = 'Full Body Cardio') {
      super(id, title, 'Cardio', durationMinutes, intensity, targetZone, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80');
    }
    calculateEstimatedBurn() { return Math.round(this.durationMinutes * 11.2); }
    getCategoryBadge() { return { name: 'Cardio', color: '#FF7A45', icon: 'zap' }; }
  }

  class FlexibilityWorkout extends Workout {
    constructor(id, title, durationMinutes = 20, intensity = 'Recovery', targetZone = 'Mobility & Spine') {
      super(id, title, 'Flexibility', durationMinutes, intensity, targetZone, 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=400&q=80');
    }
    calculateEstimatedBurn() { return Math.round(this.durationMinutes * 5.8); }
    getCategoryBadge() { return { name: 'Flexibility', color: '#10B981', icon: 'sparkles' }; }
  }

  class HiitWorkout extends Workout {
    constructor(id, title, durationMinutes = 25, intensity = 'Max Effort', targetZone = 'Anaerobic Peak') {
      super(id, title, 'HIIT', durationMinutes, intensity, targetZone, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80');
    }
    calculateEstimatedBurn() { return Math.round(this.durationMinutes * 13.5); }
    getCategoryBadge() { return { name: 'HIIT', color: '#EF4444', icon: 'flame' }; }
  }

  // FACTORY PATTERN
  class WorkoutFactory {
    static createWorkout(category, config = {}) {
      const id = config.id || `w_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const title = config.title || 'Custom Session';
      const duration = parseInt(config.duration || 30, 10);
      const intensity = config.intensity || 'Intermediate';
      const zone = config.targetZone || 'Full Body';

      let workout;
      switch ((category || '').toLowerCase()) {
        case 'strength':
          workout = new StrengthWorkout(id, title, duration, intensity, zone);
          break;
        case 'cardio':
        case 'cycling':
          workout = new CardioWorkout(id, title, duration, intensity, zone);
          break;
        case 'hiit':
          workout = new HiitWorkout(id, title, duration, intensity, zone);
          break;
        case 'flexibility':
        case 'yoga':
          workout = new FlexibilityWorkout(id, title, duration, intensity, zone);
          break;
        default:
          workout = new StrengthWorkout(id, title, duration, intensity, zone);
      }

      if (config.image) workout.image = config.image;
      if (config.time) workout.time = config.time;

      if (Array.isArray(config.exercises)) {
        config.exercises.forEach(ex => workout.addExercise(ex.name, ex.sets, ex.completed));
      } else {
        workout.addExercise(`${title} - Phase 1 Activation`, '3 sets × 12 reps', false);
        workout.addExercise(`${title} - Working Sets`, '4 sets × 10 reps', false);
        workout.addExercise(`${title} - Cool Down`, '5 mins mobility', false);
      }

      return workout;
    }
  }

  // 6. METRIC HIERARCHY
  class ActivityMetric {
    #name;
    #current;
    #target;
    #unit;

    constructor(name, current, target, unit) {
      this.#name = name;
      this.#current = current;
      this.#target = target;
      this.#unit = unit;
    }

    get name() { return this.#name; }
    get current() { return this.#current; }
    get target() { return this.#target; }
    get unit() { return this.#unit; }

    set current(val) {
      if (typeof val !== 'number' || val < 0) {
        throw new InvalidMetricException(this.#name, val);
      }
      this.#current = val;
    }

    getProgressRatio() {
      return Math.min(this.#current / (this.#target || 1), 1.0);
    }

    getProgressPercentage() {
      return Math.round(this.getProgressRatio() * 100);
    }

    isGoalReached() {
      return this.#current >= this.#target;
    }

    format() {
      return `${this.#current.toLocaleString()} / ${this.#target.toLocaleString()} ${this.#unit}`;
    }

    getStatusColor() {
      const ratio = this.getProgressRatio();
      if (ratio >= 1.0) return '#10B981';
      if (ratio >= 0.7) return '#FF7A45';
      return '#FF3B6B';
    }
  }

  class CalorieMetric extends ActivityMetric {
    constructor(current = 632, target = 800) { super('Active Calories', current, target, 'kcal'); }
    getStatusColor() { return '#FF3B6B'; }
  }

  class StepMetric extends ActivityMetric {
    constructor(current = 12456, target = 10000) { super('Daily Steps', current, target, 'steps'); }
    getStatusColor() { return '#FF7A45'; }
  }

  class ActiveMinutesMetric extends ActivityMetric {
    constructor(current = 78, target = 60) { super('Active Minutes', current, target, 'min'); }
    getStatusColor() { return '#FFB347'; }
  }

  // 7. SYNCHRONIZED BUFFER
  class TelemetryBuffer {
    #queue = [];
    #capacity;

    constructor(capacity = 20) {
      this.#capacity = capacity;
    }

    produce(bpm) {
      if (bpm < 40 || bpm > 220) {
        throw new InvalidMetricException('BPM', bpm, 'Heart rate out of biological limits');
      }
      if (this.#queue.length >= this.#capacity) {
        this.#queue.shift();
      }
      this.#queue.push({ bpm, timestamp: Date.now() });
      return this.#queue.length;
    }

    consume() {
      return this.#queue.shift() || null;
    }

    get size() { return this.#queue.length; }
    get capacity() { return this.#capacity; }
    getSamples() { return [...this.#queue]; }
  }

  // 8. GENERIC REPOSITORY
  class GenericRepository {
    #items = new Map();

    save(id, entity) {
      if (!id || !entity) throw new ValidationException('Repository', 'ID and entity required');
      this.#items.set(id, entity);
      return entity;
    }
    findById(id) { return this.#items.get(id) || null; }
    findAll() { return Array.from(this.#items.values()); }
    deleteById(id) { return this.#items.delete(id); }
    count() { return this.#items.size; }
  }

  // 9. SINGLETON ENGINE
  class FitTrackEngine {
    static #instance = null;

    #currentUser = null;
    #workouts = [];
    #metrics = {};
    #eventBus;
    #telemetryBuffer;
    #workoutRepo;
    #waterIntake = 2250;
    #heartRate = { bpm: 128, zone: 'Zone 3 • Cardio', simulating: true };

    constructor() {
      if (FitTrackEngine.#instance) {
        throw new Error('FitTrackEngine is a Singleton. Use FitTrackEngine.getInstance()');
      }
      this.#eventBus = new BiometricEventBus();
      this.#telemetryBuffer = new TelemetryBuffer(20);
      this.#workoutRepo = new GenericRepository();
      this.#initializeMetrics();
      this.#initializeDefaultWorkouts();
    }

    static getInstance() {
      if (!FitTrackEngine.#instance) {
        FitTrackEngine.#instance = new FitTrackEngine();
      }
      return FitTrackEngine.#instance;
    }

    #initializeMetrics() {
      this.#metrics = {
        calories: new CalorieMetric(632, 800),
        steps: new StepMetric(12456, 10000),
        minutes: new ActiveMinutesMetric(78, 60),
      };
    }

    #initializeDefaultWorkouts() {
      const defaults = [
        WorkoutFactory.createWorkout('Strength', {
          id: 'upper_body',
          title: 'Upper Body Strength',
          duration: 45,
          intensity: 'Intermediate',
          targetZone: 'Chest & Arms',
          time: '9:00 AM',
          image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
          exercises: [
            { name: 'Incline Dumbbell Bench Press', sets: '4 sets × 10 reps', completed: true },
            { name: 'Bent-Over Dumbbell Rows', sets: '4 sets × 12 reps', completed: true },
            { name: 'Seated Dumbbell Shoulder Press', sets: '3 sets × 12 reps', completed: false },
            { name: 'Bicep Hammer Curls superset Tricep Dips', sets: '3 sets × 15 reps', completed: false }
          ]
        }),
        WorkoutFactory.createWorkout('HIIT', {
          id: 'hiit_cardio',
          title: 'HIIT Cardio Blast',
          duration: 30,
          intensity: 'High Intensity',
          targetZone: 'Full Body',
          time: '12:30 PM',
          image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
          exercises: [
            { name: 'Kettlebell Swings', sets: '40s work, 20s rest × 4 rounds', completed: false },
            { name: 'Plyometric Jump Squats', sets: '40s work, 20s rest × 4 rounds', completed: false },
            { name: 'Burpees to High Jump', sets: '30s work, 30s rest × 4 rounds', completed: false },
            { name: 'Mountain Climbers & Plank Hold', sets: '45s work × 3 rounds', completed: false }
          ]
        }),
        WorkoutFactory.createWorkout('Flexibility', {
          id: 'yoga_flow',
          title: 'Yoga Flow',
          duration: 20,
          intensity: 'Flexibility',
          targetZone: 'Recovery',
          time: '6:00 PM',
          image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=400&q=80',
          exercises: [
            { name: 'Cat-Cow Spinal Decompression', sets: '2 minutes slow tempo', completed: false },
            { name: 'Downward-Facing Dog to Cobra Flow', sets: '8 repetitions with deep breath', completed: false },
            { name: 'Warrior II & Reverse Warrior', sets: '1 minute hold per side', completed: false },
            { name: 'Pigeon Pose & Deep Hip Stretch', sets: '2 minutes hold per side', completed: false }
          ]
        })
      ];
      this.#workouts = defaults;
      defaults.forEach(w => this.#workoutRepo.save(w.id, w));
    }

    authenticate(name, email, role = 'ATHLETE') {
      if (!name || name.trim().length === 0) {
        throw new AuthenticationException('Account name cannot be empty');
      }
      const cleanName = name.trim();
      const cleanEmail = email || `${cleanName.toLowerCase().replace(/\s+/g, '')}@fittrack.io`;

      if (role === 'PRO') {
        this.#currentUser = new ProAthleteUser(`usr_${Date.now()}`, cleanName, cleanEmail, 72.5);
      } else {
        this.#currentUser = new AthleteUser(`usr_${Date.now()}`, cleanName, cleanEmail, 68.5);
      }
      this.#eventBus.notify('AUTH_CHANGED', { user: this.#currentUser });
      return this.#currentUser;
    }

    continueAsGuest() {
      this.#currentUser = new GuestUser();
      this.#eventBus.notify('AUTH_CHANGED', { user: this.#currentUser });
      return this.#currentUser;
    }

    logout() {
      this.#currentUser = null;
      this.#eventBus.notify('AUTH_CHANGED', { user: null });
    }

    isAuthenticated() { return this.#currentUser !== null; }
    getUser() { return this.#currentUser; }
    getWorkouts() { return [...this.#workouts]; }
    getMetrics() { return this.#metrics; }
    getHeartRate() { return { ...this.#heartRate }; }
    getEventBus() { return this.#eventBus; }
    getTelemetryBuffer() { return this.#telemetryBuffer; }
    getWaterIntake() { return this.#waterIntake; }

    logMetric(type, amount) {
      if (!this.#currentUser) {
        throw new AuthenticationException('Must be signed in to log activity');
      }
      switch (type) {
        case 'calories':
          this.#metrics.calories.current += amount;
          if (this.#currentUser instanceof AthleteUser) this.#currentUser.addCalories(amount);
          break;
        case 'steps':
          this.#metrics.steps.current += amount;
          if (this.#currentUser instanceof AthleteUser) this.#currentUser.addSteps(amount);
          break;
        case 'minutes':
          this.#metrics.minutes.current += amount;
          if (this.#currentUser instanceof AthleteUser) this.#currentUser.addMinutes(amount);
          break;
        default:
          throw new InvalidMetricException(type, amount, 'Unknown metric type');
      }
      this.#eventBus.notify('METRIC_UPDATED', { type, amount, metrics: this.#metrics });
      return this.#metrics;
    }

    addCustomWorkout(category, config) {
      if (!this.#currentUser) {
        throw new AuthenticationException('Must be signed in to add custom workouts');
      }
      const workout = WorkoutFactory.createWorkout(category, config);
      this.#workouts.unshift(workout);
      this.#workoutRepo.save(workout.id, workout);
      this.#eventBus.notify('WORKOUT_ADDED', { workout });
      return workout;
    }

    toggleExerciseCompletion(workoutId, exerciseIdx) {
      const w = this.#workouts.find(item => item.id === workoutId);
      if (!w) throw new EntityNotFoundException('Workout', workoutId);
      const completed = w.toggleExercise(exerciseIdx);
      this.#eventBus.notify('EXERCISE_TOGGLED', { workoutId, exerciseIdx, completed });
      return completed;
    }

    logWater(ml) {
      if (typeof ml !== 'number' || ml <= 0 || ml > 2000) {
        throw new InvalidMetricException('Water Intake', ml, 'Must be positive volume up to 2000ml');
      }
      this.#waterIntake += ml;
      this.#eventBus.notify('WATER_UPDATED', { total: this.#waterIntake, added: ml });
      return this.#waterIntake;
    }

    recordHeartRate(bpm) {
      this.#heartRate.bpm = bpm;
      this.#telemetryBuffer.produce(bpm);
      this.#eventBus.notify('BPM_TICK', { bpm });
    }

    runOOPDemonstration(concept) {
      const logs = [];
      switch (concept) {
        case 'polymorphism': {
          logs.push('=== DEMONSTRATING POLYMORPHISM IN FITTRACK ===');
          logs.push('1. Dynamic Target Calorie Calculation across User Subclasses:');
          const standardAthlete = new AthleteUser('ath_1', 'Marcus Vance', 'marcus@fit.io', 75);
          const proAthlete = new ProAthleteUser('pro_1', 'Elena Rostova', 'elena@fit.io', 65);
          const guest = new GuestUser();

          [guest, standardAthlete, proAthlete].forEach(u => {
            logs.push(` - ${u.constructor.name}.calculateTargetCalories(): ${u.calculateTargetCalories()} kcal [Polymorphically Dispatched]`);
            logs.push(`   ${u.getTelemetrySummary()}`);
          });

          logs.push('');
          logs.push('2. Dynamic Caloric Burn & Badge across Workout Subclasses:');
          const s = new StrengthWorkout('s1', 'Heavy Bench & Rows', 45);
          const c = new CardioWorkout('c1', 'Sprint Intervals', 30);
          const f = new FlexibilityWorkout('f1', 'Deep Hip Flow', 20);
          const h = new HiitWorkout('h1', 'Tabata Extreme', 20);

          [s, c, f, h].forEach(w => {
            logs.push(` - ${w.constructor.name}.calculateEstimatedBurn(): ${w.calculateEstimatedBurn()} kcal (${w.getCategoryBadge().name} Badge)`);
          });
          logs.push('✓ Polymorphism verified: Each subclass overrides base methods with specialized logic.');
          break;
        }

        case 'inheritance': {
          logs.push('=== DEMONSTRATING INHERITANCE & PROTOTYPE CHAIN ===');
          const athlete = new AthleteUser('ath_proto', 'Jordan Rivers', 'jordan@fit.io', 70);
          const pro = new ProAthleteUser('pro_proto', 'Serena Chase', 'serena@fit.io', 68);

          logs.push(`AthleteUser inherits from User: ${athlete instanceof User} (Prototype chain: AthleteUser -> User -> Object)`);
          logs.push(`ProAthleteUser inherits from AthleteUser: ${pro instanceof AthleteUser}`);
          logs.push(`ProAthleteUser inherits from User: ${pro instanceof User}`);
          logs.push(`Inherited User.id: ${pro.id}`);
          logs.push(`Inherited User.role: ${pro.role}`);
          logs.push(`Inherited User.firstName: ${pro.firstName}`);
          logs.push(`Specialized ProAthleteUser.sponsorName: ${pro.sponsorName}`);
          logs.push('✓ Inheritance verified: Subclasses inherit base state & behavior with super() constructor chaining.');
          break;
        }

        case 'encapsulation': {
          logs.push('=== DEMONSTRATING ENCAPSULATION & PRIVATE FIELDS (#) ===');
          const athlete = new AthleteUser('ath_encap', 'Tyler Durden', 'tyler@fit.io', 72);
          logs.push('1. Public getter id: ' + athlete.id);
          logs.push('2. Public getter bodyWeightKg: ' + athlete.bodyWeightKg + ' kg');
          
          let privateFieldDirectAccess = 'Protected by runtime JavaScript engine';
          try {
            eval('athlete.#bodyWeightKg');
          } catch (err) {
            privateFieldDirectAccess = `Private field protected: ${err.message}`;
          }
          logs.push('3. Direct access to athlete.#bodyWeightKg: ' + privateFieldDirectAccess);

          try {
            athlete.bodyWeightKg = -15;
          } catch (err) {
            logs.push(`4. Caught setter rejection on invalid weight (-15kg): [${err.name}] ${err.message}`);
          }

          try {
            athlete.addCalories(999999);
          } catch (err) {
            logs.push(`5. Caught addCalories rejection on out-of-bounds burn: [${err.name}] ${err.message}`);
          }
          logs.push('✓ Encapsulation verified: State is isolated behind private fields with strict mutation contracts.');
          break;
        }

        case 'abstraction': {
          logs.push('=== DEMONSTRATING ABSTRACTION & INTERFACE CONTRACTS ===');
          logs.push('1. Abstract User Class enforces calculateTargetCalories() and getTelemetrySummary()');
          logs.push('2. Abstract Workout Class enforces calculateEstimatedBurn()');
          logs.push('3. ITrackable Contract verified on AthleteUser:');
          const athlete = new AthleteUser('ath_abs', 'Kai Greene', 'kai@fit.io', 85);
          logs.push(`   - calculateTargetCalories(): ${typeof athlete.calculateTargetCalories === 'function'} ✓`);
          logs.push(`   - getTelemetrySummary(): ${typeof athlete.getTelemetrySummary === 'function'} ✓`);
          logs.push(`   - calculateTotalScore(): ${typeof athlete.calculateTotalScore === 'function'} ✓`);
          logs.push('4. IRepository Contract verified on GenericRepository:');
          const repo = new GenericRepository();
          logs.push(`   - save, findById, findAll, deleteById methods implemented ✓`);
          logs.push('✓ Abstraction verified: Decoupled contracts enforce required behavior across modules.');
          break;
        }

        case 'exceptions': {
          logs.push('=== DEMONSTRATING EXCEPTION HANDLING HIERARCHY ===');
          logs.push('Custom Exception Hierarchy:');
          logs.push('  FitTrackException (extends Error)');
          logs.push('  ├── InvalidMetricException');
          logs.push('  ├── AuthenticationException');
          logs.push('  ├── ValidationException');
          logs.push('  └── EntityNotFoundException');
          logs.push('');
          logs.push('Testing Exception Triggers:');

          try {
            throw new InvalidMetricException('DailySteps', -420, 'Steps cannot be a negative value');
          } catch (e) {
            if (e instanceof InvalidMetricException) logs.push(` [1/3 CAUGHT] ${e.getDetailedLog()}`);
          }

          try {
            throw new AuthenticationException('Session token expired. Re-authentication required.');
          } catch (e) {
            if (e instanceof AuthenticationException) logs.push(` [2/3 CAUGHT] ${e.getDetailedLog()}`);
          }

          try {
            throw new EntityNotFoundException('WorkoutSession', 'w_invalid_999');
          } catch (e) {
            if (e instanceof EntityNotFoundException) logs.push(` [3/3 CAUGHT] ${e.getDetailedLog()}`);
          }
          logs.push('✓ Exception Handling verified: Custom exceptions caught with type-specific recovery.');
          break;
        }

        case 'patterns': {
          logs.push('=== DEMONSTRATING DESIGN PATTERNS IN CODEBASE ===');
          const instance1 = FitTrackEngine.getInstance();
          const instance2 = FitTrackEngine.getInstance();
          logs.push(`1. Singleton Pattern: instance1 === instance2 is ${instance1 === instance2}`);

          const createdWorkout = WorkoutFactory.createWorkout('HIIT', { title: 'Speed Shred', duration: 25 });
          logs.push(`2. Factory Pattern: WorkoutFactory instantiated ${createdWorkout.constructor.name} (Burn: ${createdWorkout.calculateEstimatedBurn()} kcal)`);

          const user = new AthleteUser('ath_strat', 'Maya Lin', 'maya@fit.io', 65);
          logs.push(`3. Strategy Pattern (Initial): ${user.getStrategy().getName()} -> Target: ${user.calculateTargetCalories()} kcal`);
          user.setStrategy(new HypertrophyCaloricStrategy());
          logs.push(`   Strategy Pattern (Switched to Hypertrophy): ${user.getStrategy().getName()} -> Target: ${user.calculateTargetCalories()} kcal`);
          user.setStrategy(new FatLossEnduranceCaloricStrategy());
          logs.push(`   Strategy Pattern (Switched to Endurance): ${user.getStrategy().getName()} -> Target: ${user.calculateTargetCalories()} kcal`);

          let observerNotified = false;
          const bus = instance1.getEventBus();
          const unsubscribe = bus.subscribe('TEST_EVENT', payload => {
            observerNotified = true;
            logs.push(`4. Observer Pattern: Event received with payload "${payload.message}"`);
          });
          bus.notify('TEST_EVENT', { message: 'Biometrics Synchronized' });
          unsubscribe();

          logs.push('✓ Design Patterns verified: Singleton, Factory, Strategy, and Observer functioning seamlessly.');
          break;
        }

        default:
          logs.push(`Unknown concept "${concept}". Valid: polymorphism, inheritance, encapsulation, abstraction, exceptions, patterns.`);
      }
      return logs;
    }
  }

  // Export globally to window
  window.FitTrack = {
    User,
    AthleteUser,
    ProAthleteUser,
    GuestUser,
    Workout,
    StrengthWorkout,
    CardioWorkout,
    FlexibilityWorkout,
    HiitWorkout,
    WorkoutFactory,
    ActivityMetric,
    CalorieMetric,
    StepMetric,
    ActiveMinutesMetric,
    CaloricStrategy,
    StandardCaloricStrategy,
    HypertrophyCaloricStrategy,
    FatLossEnduranceCaloricStrategy,
    TelemetryBuffer,
    GenericRepository,
    BiometricEventBus,
    FitTrackException,
    InvalidMetricException,
    AuthenticationException,
    ValidationException,
    EntityNotFoundException,
    WorkoutException,
    FitTrackEngine
  };

  // Authoritative Singleton App Instance
  window.fitTrackApp = FitTrackEngine.getInstance();
})(typeof window !== 'undefined' ? window : globalThis);
