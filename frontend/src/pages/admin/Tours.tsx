import { useEffect, useState } from 'react';

interface Tour {
  id: number;
  category_id: number;
  title: string;
  price: number;
  duration: number;
  location: string;
  category?: { name: string };
}

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    fetch('/api/v1/tours')
      .then(res => res.json())
      .then(data => {
        if (data.tours) setTours(data.tours);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Tours</h1>
        <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
          Add Tour
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Location</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map(tour => (
              <tr key={tour.id} className="text-center">
                <td className="py-2 px-4 border-b">{tour.id}</td>
                <td className="py-2 px-4 border-b">{tour.title}</td>
                <td className="py-2 px-4 border-b">{tour.category?.name || tour.category_id}</td>
                <td className="py-2 px-4 border-b">{tour.location}</td>
                <td className="py-2 px-4 border-b">${tour.price}</td>
                <td className="py-2 px-4 border-b space-x-2">
                  <button className="text-blue-500 hover:underline">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">No tours found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
