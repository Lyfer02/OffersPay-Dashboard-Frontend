import { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Typography, 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter,
  Select,
  Option,
  Checkbox,
  Input,
  Textarea
} from '@material-tailwind/react';
import { X, Plus, ChevronDown } from 'lucide-react';

// Example available offers data - you would replace this with your actual data source
const availableOffers = [
  { id: 101, title: "20% Off Electronics", store: "TechWorld", category: "Electronics" },
  { id: 102, title: "Buy One Get One Free", store: "FashionHub", category: "Clothing" },
  { id: 103, title: "Free Shipping on $50+", store: "HomeGoods", category: "Home & Kitchen" },
  { id: 104, title: "$10 Off Your First Order", store: "GroceryMart", category: "Food" },
  { id: 105, title: "30% Off Selected Items", store: "SportsMaster", category: "Sports" },
  { id: 106, title: "Holiday Special: 15% Off", store: "MultiStore", category: "General" }
];

export const SelectOffersForm = ({ onClose, onSubmit }) => {
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [customOptions, setCustomOptions] = useState({
    featured: false,
    priorityDisplay: false,
    limitedTime: false,
    notifyUsers: false,
  });
  const [expiryDate, setExpiryDate] = useState('');

  // Extract unique categories and stores for filter dropdowns
  const uniqueCategories = [...new Set(availableOffers.map(offer => offer.category))];
  const uniqueStores = [...new Set(availableOffers.map(offer => offer.store))];

  // Filter offers based on search term and filters
  const filteredOffers = availableOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          offer.store.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? offer.category === selectedCategory : true;
    const matchesStore = selectedStore ? offer.store === selectedStore : true;
    
    return matchesSearch && matchesCategory && matchesStore;
  });

  // Toggle offer selection
  const toggleSelectOffer = (offerId) => {
    setSelectedOffers(prev => {
      if (prev.includes(offerId)) {
        return prev.filter(id => id !== offerId);
      } else {
        return [...prev, offerId];
      }
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Get full offer objects for selected IDs
    const offersToAdd = availableOffers
      .filter(offer => selectedOffers.includes(offer.id))
      .map(offer => ({
        ...offer,
        featured: customOptions.featured,
        priorityDisplay: customOptions.priorityDisplay,
        limitedTime: customOptions.limitedTime,
        notifyUsers: customOptions.notifyUsers,
        expiryDate: expiryDate || null,
        status: 'publish',
        dateAdded: new Date().toISOString(),
      }));

    onSubmit(offersToAdd);
    onClose();
  };

  return (
    <Dialog open={true} handler={onClose} size="lg">
      <DialogHeader className="flex items-center justify-between">
        <Typography variant="h5">
          Select Trending Offers
        </Typography>
        <Button 
          variant="text" 
          color="blue-gray" 
          className="p-2" 
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </DialogHeader>

      <DialogBody className="overflow-y-auto max-h-[70vh]">
        <div className="space-y-6">

            {/* Selected Count */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <Typography className="font-medium text-blue-800">
              {selectedOffers.length} offers selected
            </Typography>
          </div>
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-3">
              <Input
                label="Search Offers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<ChevronDown />}
              />
            </div>

            <div>
              <Select
                label="Filter by Category"
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
              >
                <Option value="">All Categories</Option>
                {uniqueCategories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                label="Filter by Store"
                value={selectedStore}
                onChange={(value) => setSelectedStore(value)}
              >
                <Option value="">All Stores</Option>
                {uniqueStores.map(store => (
                  <Option key={store} value={store}>{store}</Option>
                ))}
              </Select>
            </div>

            <div>
              <Input
                type="date"
                label="Expiry Date (Optional)"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Available Offers */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Typography variant="h6" className="mb-4">
              Available Offers ({filteredOffers.length})
            </Typography>
            
            <div className="space-y-3">
              {filteredOffers.length > 0 ? (
                filteredOffers.map(offer => (
                  <Card key={offer.id} className="p-3 shadow-sm hover:shadow transition-all">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedOffers.includes(offer.id)}
                        onChange={() => toggleSelectOffer(offer.id)}
                        color="blue"
                      />
                      <div className="ml-2 flex-1">
                        <Typography variant="paragraph" className="font-medium text-blue-800">
                          {offer.title}
                        </Typography>
                        <Typography variant="small" className="text-gray-600">
                          {offer.store} • {offer.category}
                        </Typography>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Typography className="text-center text-gray-500 py-8">
                  No offers match your search criteria
                </Typography>
              )}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <Typography variant="h6" className="mb-4">
              Display Options
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={customOptions.featured}
                  onChange={() => setCustomOptions(prev => ({ ...prev, featured: !prev.featured }))}
                  color="blue"
                />
                <Typography>Mark as Featured</Typography>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={customOptions.priorityDisplay}
                  onChange={() => setCustomOptions(prev => ({ ...prev, priorityDisplay: !prev.priorityDisplay }))}
                  color="blue"
                />
                <Typography>Priority Display</Typography>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={customOptions.limitedTime}
                  onChange={() => setCustomOptions(prev => ({ ...prev, limitedTime: !prev.limitedTime }))}
                  color="blue"
                />
                <Typography>Limited Time Offer</Typography>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={customOptions.notifyUsers}
                  onChange={() => setCustomOptions(prev => ({ ...prev, notifyUsers: !prev.notifyUsers }))}
                  color="blue"
                />
                <Typography>Notify Users</Typography>
              </div>
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <Textarea 
              label="Additional Notes (Optional)"
              rows={3}
            />
          </div>

          
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between">
        <Button variant="text" color="red" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="gradient" 
          color="blue" 
          className="flex items-center gap-2"
          onClick={handleSubmit}
          disabled={selectedOffers.length === 0}
        >
          <Plus size={16} />
          Add Selected Offers
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SelectOffersForm;