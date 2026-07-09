import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
  Input
} from '@material-tailwind/react';
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  GripVertical,
  Store,
  Network,
  Award,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { storeService } from '@/api/services/stores.service';
import { networkService } from '@/api/services/network.service';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';

// Sortable Row Component
const SortableRow = ({ store, index, totalStores, onPositionChange, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: store._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-100 transition-colors ${
        isDragging ? 'bg-gray-100 shadow-lg relative z-10' : ''
      }`}
    >
      <td className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-purple-600 touch-none"
          >
            <GripVertical size={18} />
          </div>
          <div className="flex flex-col items-center">
            <Typography variant="h6" className="font-bold text-deep-purple-600">
              #{store.position}
            </Typography>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => onPositionChange(store._id, 'up')}
                disabled={index === 0}
                className="p-1 rounded text-gray-400 hover:text-blue-600 disabled:opacity-30"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => onPositionChange(store._id, 'down')}
                disabled={index === totalStores - 1}
                className="p-1 rounded text-gray-400 hover:text-blue-600 disabled:opacity-30"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </td>
      <td className="p-4 border-b">
        <div className="flex items-center gap-3">
          <img
            src={store.image}
            alt={store.name}
            className="w-16 h-10  rounded-md shadow-sm"
          />
          <div>
            <Typography variant="small" className="font-medium">
              {store.name}
            </Typography>
            <Typography variant="small" className="text-gray-500 text-xs">
              {store.about?.substring(0, 40)}...
            </Typography>
          </div>
        </div>
      </td>
      <td className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Network size={14} className="text-purple-600" />
          <Typography variant="small" className="font-medium">
            {store.network?.name}
          </Typography>
        </div>
      </td>
      <td className="p-4 border-b">
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500 fill-current" />
          <Typography variant="small" className="font-medium">
            {store.rating}
          </Typography>
        </div>
      </td>
      <td className="p-4 border-b">
        <Typography variant="small" className="font-medium text-green-600">
          {store.earn}%
        </Typography>
      </td>
      <td className="p-4 border-b">
        <Chip
          size="sm"
          variant="gradient"
          color={store.status === 'active' ? "green" : "red"}
          value={store.status}
          className="py-1 px-2 text-xs font-medium w-fit capitalize"
        />
      </td>
      <td className="p-4 border-b">
        <Button
          size="sm"
          color="red"
          variant="text"
          onClick={() => onRemove(store._id, store.name)}
          className="flex items-center gap-2 p-2"
        >
          <Trash2 size={14} />
          Remove
        </Button>
      </td>
    </tr>
  );
};

const ManageStore = () => {
  const [featuredStores, setFeaturedStores] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeToRemove, setStoreToRemove] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [newPosition, setNewPosition] = useState(1);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Statistics
  const totalFeatured = featuredStores.length;
  const averageRating = featuredStores.length > 0 
    ? (featuredStores.reduce((sum, store) => sum + store.rating, 0) / featuredStores.length).toFixed(1)
    : 0;
  const averageEarning = featuredStores.length > 0
    ? (featuredStores.reduce((sum, store) => sum + store.earn, 0) / featuredStores.length).toFixed(1)
    : 0;

  useEffect(() => {
    fetchFeaturedStores();
    fetchNetworks();
  }, []);

  const fetchFeaturedStores = async () => {
    setLoading(true);
    try {
      const response = await storeService.list(1, { featured: true });
      console.log("this is response", response);
      
      const sortedStores = response.data.data.storeData.sort((a, b) => a.position - b.position);
      setFeaturedStores(sortedStores);
    } catch (error) {
      toast.error('Failed to fetch featured stores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworks = async () => {
    try {
      const response = await networkService.list();
      setNetworks(response.data?.data?.networks);
    } catch (error) {
      toast.error('Failed to fetch networks');
      console.error(error);
    }
  };

  const fetchStoresByNetwork = async (networkId) => {
    if (!networkId) return;
    setLoading(true);
    try {
      const response = await storeService.list(1, { network: networkId });
      
      // Filter out already featured stores
      const nonFeaturedStores = response.data?.data?.storeData.filter(store => !store.featured);
      setStores(nonFeaturedStores);
    } catch (error) {
      toast.error('Failed to fetch stores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkChange = (value) => {
    setSelectedNetwork(value);
    setSelectedStore('');
    setStores([]);
    if (value) {
      fetchStoresByNetwork(value);
    }
  };

  const handleAddToFeatured = async () => {
    if (!selectedStore) {
      toast.error('Please select a store');
      return;
    }

    setLoading(true);
    try {
      const response = await storeService.updateFields({
        id: selectedStore, 
        fields: { position: newPosition, featured: true }
      });
      
      toast.success('Store added to featured list');
      setShowAddDialog(false);
      setSelectedNetwork('');
      setSelectedStore('');
      setNewPosition(1);
      fetchFeaturedStores();
    } catch (error) {
      setShowAddDialog(false);
      setSelectedNetwork('');
      setSelectedStore('');
      setNewPosition(1);
      toast.error(error.response?.data?.message || 'Failed to add store to featured');
      console.error("This is error ", error);
    } finally {
      setLoading(false);
    }
  };

const handleRemoveFromFeatured = (storeId, storeName) => {
  setStoreToRemove({ id: storeId, name: storeName });
  setShowRemoveConfirm(true);
};

const confirmRemoveFromFeatured = async () => {
  if (!storeToRemove) return;

  setLoading(true);
  try {
    const response = await storeService.updateFields({
      id: storeToRemove.id, 
      fields: { position: 0, featured: false }
    });
    
    toast.success(`${storeToRemove.name} removed from featured stores`);
    setShowRemoveConfirm(false);
    setStoreToRemove(null);
    fetchFeaturedStores();
  } catch (error) {
    toast.error('Failed to remove store from featured');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = featuredStores.findIndex(store => store._id === active.id);
    const newIndex = featuredStores.findIndex(store => store._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the array
    const newStores = arrayMove(featuredStores, oldIndex, newIndex);
    
    // Update positions for all items
    const updatedItems = newStores.map((item, index) => ({
      ...item,
      position: index + 1
    }));

    // Optimistically update the UI
    setFeaturedStores(updatedItems);

    try {
      // Use bulk update endpoint for drag-and-drop reordering
      const storeUpdates = updatedItems.map(store => ({
        id: store._id,
        position: store.position
      }));

      await storeService.bulkUpdatePositions(storeUpdates);
      toast.success('Positions updated successfully');
    } catch (error) {
      toast.error('Failed to update positions');
      console.error(error);
      // Revert the UI changes on error
      fetchFeaturedStores();
    }
  };

  const handlePositionChange = async (storeId, direction) => {
    const currentIndex = featuredStores.findIndex(store => store._id === storeId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === featuredStores.length - 1)
    ) {
      return;
    }

    const newStores = [...featuredStores];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Get the two stores that will be swapped
    const currentStore = newStores[currentIndex];
    const targetStore = newStores[targetIndex];
    
    // Swap positions in the array
    [newStores[currentIndex], newStores[targetIndex]] = [newStores[targetIndex], newStores[currentIndex]];
    
    // Update position numbers for the swapped stores
    const newCurrentPosition = targetIndex + 1;
    const newTargetPosition = currentIndex + 1;
    
    newStores[targetIndex].position = newCurrentPosition;
    newStores[currentIndex].position = newTargetPosition;

    // Optimistically update the UI
    setFeaturedStores(newStores);

    try {
      // Use the swap functionality instead of individual updates
      await storeService.updateFields({
        id: currentStore._id,
        isSwap: true,
        swapWithId: targetStore._id,
        fields: {} // Empty fields since we're only swapping
      });
      
      toast.success('Position updated successfully');
    } catch (error) {
      toast.error('Failed to update position');
      console.error(error);
      // Revert on error
      fetchFeaturedStores();
    }
  };

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-8">
      {/* Main Featured Stores Table */}
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Featured Stores Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage store positions and featured status with drag-and-drop reordering
              </Typography>
            </div>
            <Button 
              variant="outlined" 
              color="white" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus size={16} /> Add Featured Store
            </Button>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-purple-100 to-purple-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography className=" text-sm">Featured Stores</Typography>
                    <Typography variant="h4"  className="font-bold text-purple-600">{totalFeatured}</Typography>
                  </div>
                  <Award size={32} className="text-purple-600" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-blue-100 to-blue-200 ">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography className=" text-sm">Average Rating</Typography>
                    <Typography variant="h4" className="font-bold flex items-center gap-1 text-blue-600">
                      {averageRating} <Star size={20} className="text-yellow-300 fill-current" />
                    </Typography>
                  </div>
                  <TrendingUp size={32} className="text-blue-600" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-green-100 to-green-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography className=" text-sm">Avg. Earning</Typography>
                    <Typography variant="h4" className="font-bold text-green-600">{averageEarning}%</Typography>
                  </div>
                  <ShoppingBag size={32} className="text-green-600" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-orange-100 to-orange-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography className=" text-sm">Active Networks</Typography>
                    <Typography variant="h4" className="font-bold text-orange-600">{networks.length}</Typography>
                  </div>
                  <Network size={32} className="text-orange-600" />
                </div>
              </CardBody>
            </Card>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-purple-500"></div>
            </div>
          )}

          {!loading && featuredStores.length === 0 && (
            <div className="text-center py-12">
              <Award size={64} className="mx-auto text-gray-300 mb-4" />
              <Typography variant="h6" color="gray" className="mb-2">No Featured Stores</Typography>
              <Typography color="gray" className="mb-4">
                Add stores to your featured list to showcase them prominently
              </Typography>
              <Button 
                color="deep-purple" 
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={16} /> Add First Featured Store
              </Button>
            </div>
          )}

          {!loading && featuredStores.length > 0 && (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="border-b py-4 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-deep-purple-900">
                          Position
                        </Typography>
                      </th>
                      <th className="border-b py-4 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-deep-purple-900">
                          Store
                        </Typography>
                      </th>
                      <th className="border-b py-4 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-deep-purple-900">
                          Network
                        </Typography>
                      </th>
                      <th className="border-b py-4 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-deep-purple-900">
                          Rating
                        </Typography>
                      </th>
                      <th className="border-b py-4 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-deep-purple-900">
                          Earning
                        </Typography>
                      </th>
                      <th className="border-b py-4 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-deep-purple-900">
                          Status
                        </Typography>
                      </th>
                      <th className="border-b py-4 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-deep-purple-900">
                          Actions
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <SortableContext 
                      items={featuredStores.map(store => store._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {featuredStores.map((store, index) => (
                        <SortableRow
                          key={store._id}
                          store={store}
                          index={index}
                          totalStores={featuredStores.length}
                          onPositionChange={handlePositionChange}
                          onRemove={handleRemoveFromFeatured}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            </DndContext>
          )}
        </CardBody>
      </Card>

      {/* Add Featured Store Dialog */}
      <Dialog open={showAddDialog} handler={() => setShowAddDialog(false)} size="md">
        <DialogHeader className="flex items-center gap-2">
          <Plus size={24} className="text-deep-purple-600" />
          Add Store to Featured List
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <Typography variant="small" className="mb-2 font-medium text-gray-700">
              Select Network
            </Typography>
            <Select 
              value={selectedNetwork} 
              onChange={handleNetworkChange}
              label="Choose Network"
            >
              {networks.map(network => (
                <Option key={network._id} value={network._id}>
                  {network.name}
                </Option>
              ))}
            </Select>
          </div>

          {selectedNetwork && (
            <div>
              <Typography variant="small" className="mb-2 font-medium text-gray-700">
                Select Store
              </Typography>
              <Select 
                value={selectedStore} 
                onChange={setSelectedStore}
                label="Choose Store"
                disabled={stores.length === 0}
                selected={(element) => {
                                        const newselectedStore = stores.find(s => s._id === selectedStore);
                                        return newselectedStore ? newselectedStore.name : '';
                                    }}

              >
                {stores.map(store => (
                  <Option key={store._id} value={store._id}>
                    {store.name}
                  </Option>
                ))}
              </Select>
              {stores.length === 0 && selectedNetwork && (
                <Typography variant="small" className="text-gray-500 mt-1">
                  No available stores in this network or all stores are already featured
                </Typography>
              )}
            </div>
          )}

          <div>
            <Typography variant="small" className="mb-2 font-medium text-gray-700">
              Position (Optional)
            </Typography>
            <Input
              type="number"
              value={newPosition}
              onChange={(e) => setNewPosition(parseInt(e.target.value) || 0)}
              label="Featured Position"
              max="6"
            />
            <Typography variant="small" className="text-gray-500 mt-1">
              Position must be between 1-6. If position is taken, next available will be assigned.
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowAddDialog(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="deep-purple"
            onClick={handleAddToFeatured}
            disabled={!selectedStore || loading}
            className="flex items-center gap-2"
          >
            {loading ? 'Adding...' : 'Add to Featured'}
          </Button>
        </DialogFooter>
      </Dialog>

      <ConfirmationDialog
  isOpen={showRemoveConfirm}
  onClose={() => {
    setShowRemoveConfirm(false);
    setStoreToRemove(null);
  }}
  onConfirm={confirmRemoveFromFeatured}
  title="Remove Featured Store"
  message={`Are you sure you want to remove "${storeToRemove?.name}" from featured stores? This will reset its position to 0.`}
/>
    </div>
  );
};

export default ManageStore;