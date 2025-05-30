import NewAttendeeForm from './components/NewAttendeeForm';
import bg from './assets/background.png';   // Vite rewrites this to /assets/bg-ab12cd.png

export default function App() {
  return (
    <main  className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}>
      <h1 className="text-2xl font-semibold mb-4">Add attendee</h1>
      <NewAttendeeForm />
    </main>
  );
}
